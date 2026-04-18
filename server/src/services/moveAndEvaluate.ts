import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { chatMessages, matches, matchStates } from "../db/schema";
import type {
  AiFunctionCallingToolContext,
  HandoffFunctionCallingTool,
} from "./aiFunctionCallingTool";
import {
  sfenToBoard,
  japaneseToUsiMove,
  isLegalMove,
  applyUsiMove,
  boardToSfen,
} from "../shared/services";
import { evaluatePosition } from "../lib/evaluatePosition";
import { generateBestMovePrompt } from "./generateBestMovePrompt";
import type { BestMoveContent } from "../shared/schemas/chatMessage";
import { streamChat } from "../lib/deepseek";
import { shogiEvaluationSystemPrompt } from "./shogiChatConfig";
import { sfenToAscii } from "../shared/services/sfenToAscii";

const ArgsSchema = z.object({
  move: z
    .string()
    .describe(
      '指し手（日本語形式）。例: "7六歩", "7六歩(7七)", "5五金打", "2四角成"のようなフォーマットです。勝手に手を変えるのは禁止です。ユーザーの指し手をそのまま抽出して、引数にしてください。',
    ),
});

type Args = z.infer<typeof ArgsSchema>;

async function updateChatMessageWithError(
  chatMessageId: string,
  errorMessage: string,
): Promise<void> {
  await db
    .update(chatMessages)
    .set({
      role: "ASSISTANT",
      contents: [{ type: "markdown", content: errorMessage }],
      isPartial: false,
      updatedAt: new Date(),
    })
    .where(eq(chatMessages.id, chatMessageId));
}

async function execute(context: AiFunctionCallingToolContext, args: Args): Promise<void> {
  const { matchId, chatMessageId } = context;
  const { move } = args;

  try {
    const latestState = await db.query.matchStates.findFirst({
      where: eq(matchStates.matchId, matchId),
      orderBy: desc(matchStates.index),
    });

    if (!latestState) {
      await updateChatMessageWithError(chatMessageId, "対局の局面が見つかりませんでした。");
      return;
    }

    const match = await db.query.matches.findFirst({
      where: eq(matches.id, matchId),
    });

    if (!match) {
      await updateChatMessageWithError(chatMessageId, "対局情報が見つかりませんでした。");
      return;
    }

    const name = match.playerSente;

    const board = sfenToBoard(latestState.sfen);
    const usiMove = japaneseToUsiMove(move, board, latestState.usiMove);

    if (!usiMove) {
      await updateChatMessageWithError(
        chatMessageId,
        `${name}さん、「${move}」を指し手として認識できませんでした。`,
      );
      return;
    }

    if (!isLegalMove(board, usiMove)) {
      const asciiBoard = sfenToAscii(latestState.sfen);
      console.log(`Illegal move: ${move} (${usiMove})`);
      console.log("Current Board:");
      console.log(asciiBoard);

      await updateChatMessageWithError(
        chatMessageId,
        `${name}さん、「${move}」は現在の局面では指せない手です。`,
      );
      return;
    }

    const beforeEvalResult = await evaluatePosition(latestState.sfen, 5, 10000);

    const newBoard = applyUsiMove(board, usiMove);
    const newSfen = boardToSfen(newBoard);
    const newIndex = latestState.index + 1;

    const [newState] = await db
      .insert(matchStates)
      .values({
        matchId,
        index: newIndex,
        sfen: newSfen,
        usiMove,
        createdAt: new Date(),
      })
      .returning();

    const nextTurn = newBoard.turn;
    const isAiTurn = nextTurn === "SENTE" ? match.senteType === "AI" : match.goteType === "AI";

    if (isAiTurn) {
      try {
        const afterEvalResult = await evaluatePosition(newSfen, 5, 10000);

        const bestMoveContent: BestMoveContent = {
          type: "bestmove",
          bestmove: afterEvalResult.bestmove,
          variations: afterEvalResult.variations,
          timeMs: afterEvalResult.timeMs,
          engineName: afterEvalResult.engineName,
          sfen: newSfen,
        };

        const newBoardWithAiMove = applyUsiMove(newBoard, afterEvalResult.bestmove);
        const aiMoveIndex = newState.index + 1;
        const aiSfen = boardToSfen(newBoardWithAiMove);

        // バックグラウンドで評価をキャッシュ
        evaluatePosition(aiSfen, 5, 10000);

        const promptText = generateBestMovePrompt({
          beforeSfen: latestState.sfen,
          beforeVariations: beforeEvalResult.variations,
          afterSfen: newSfen,
          afterVariations: afterEvalResult.variations,
          userMove: usiMove,
          turnNumber: newState.index,
        });

        console.log(promptText);

        const messageContent = { type: "markdown" as const, content: "" };
        const stream = streamChat({
          userMessage: promptText,
          systemPrompt: shogiEvaluationSystemPrompt,
          temperature: 0.0,
        });

        const throttleInterval = 100;
        let lastUpdateTime = 0;

        for await (const chunk of stream) {
          messageContent.content += chunk;

          const now = Date.now();
          if (now - lastUpdateTime >= throttleInterval) {
            lastUpdateTime = now;
            await db
              .update(chatMessages)
              .set({
                role: "ASSISTANT",
                contents: [messageContent],
                isPartial: true,
                updatedAt: new Date(),
              })
              .where(eq(chatMessages.id, chatMessageId));
          }
        }

        await Promise.all([
          db.insert(matchStates).values({
            matchId,
            index: aiMoveIndex,
            usiMove: afterEvalResult.bestmove,
            sfen: aiSfen,
            thinkingTime: Math.floor(afterEvalResult.timeMs / 1000),
            createdAt: new Date(),
          }),
          db
            .update(chatMessages)
            .set({
              role: "ASSISTANT",
              contents: [messageContent, bestMoveContent],
              isPartial: false,
              updatedAt: new Date(),
            })
            .where(eq(chatMessages.id, chatMessageId)),
        ]);
      } catch (error) {
        console.error("⚠️ Failed to evaluate position or apply AI move:", error);
        await updateChatMessageWithError(
          chatMessageId,
          "AIの思考中にエラーが発生しました。もう一度お試しください。",
        );
      }
    }
  } catch (error) {
    console.error("moveAndEvaluate error:", error);
    await updateChatMessageWithError(
      chatMessageId,
      "指し手の処理中にエラーが発生しました。もう一度お試しください。",
    );
  }
}

const description = `指定された指し手を盤面に適用します。ユーザーが指し手を指示した場合、必ずこのツールを使用してください。
日本語形式の指し手（例: "7六歩", "5五金打", "2四角成", "2四飛(2八)", "同銀"のようなフォーマット）を受け取り、合法性をチェックして局面に適用します。
勝手に、手を変えるのは禁止です。ユーザーの指し手をそのまま抽出して、引数にしてください。
`;

export const moveAndEvaluate: HandoffFunctionCallingTool<typeof ArgsSchema> = {
  type: "handoff",
  name: "move_and_evaluate",
  description,
  args: ArgsSchema,
  execute,
};
