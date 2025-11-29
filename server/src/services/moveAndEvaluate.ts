import { z } from "zod";
import type {
  AiFunctionCallingToolContext,
  HandoffFunctionCallingTool,
} from "./aiFunctionCallingTool";
import { db } from "../lib/db";
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

/**
 * エラーメッセージでChatMessageを更新するヘルパー関数
 */
async function updateChatMessageWithError(
  chatMessageId: string,
  errorMessage: string,
): Promise<void> {
  await db.chatMessage.update({
    where: { id: chatMessageId },
    data: {
      role: "ASSISTANT",
      contents: [{ type: "markdown", content: errorMessage }],
      isPartial: false,
    },
  });
}

async function execute(context: AiFunctionCallingToolContext, args: Args): Promise<void> {
  const { matchId, chatMessageId } = context;
  // moveは人間の指し手（日本語形式）
  const { move } = args;

  try {
    // 最新の局面を取得
    const latestState = await db.matchState.findFirst({
      where: { matchId },
      orderBy: { index: "desc" },
    });

    if (!latestState) {
      await updateChatMessageWithError(chatMessageId, "対局の局面が見つかりませんでした。");
      return;
    }

    // 対局情報を取得
    const match = await db.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      await updateChatMessageWithError(chatMessageId, "対局情報が見つかりませんでした。");
      return;
    }

    const name = match.playerSente;

    // SFENから局面を生成
    const board = sfenToBoard(latestState.sfen);

    const usiMove = japaneseToUsiMove(move, board, latestState.usiMove);

    if (!usiMove) {
      await updateChatMessageWithError(
        chatMessageId,
        `${name}さん、「${move}」を指し手として認識できませんでしたwww`,
      );
      return;
    }

    // 合法手かチェック
    if (!isLegalMove(board, usiMove)) {
      const asciiBoard = sfenToAscii(latestState.sfen);
      console.log(`Illegal move: ${move} (${usiMove})`);
      console.log("Current Board:");
      console.log(asciiBoard);

      await updateChatMessageWithError(
        chatMessageId,
        `${name}さん、「${move}」は現在の局面では指せない手ですwww`,
      );
      return;
    }

    // ユーザーの手を指す前の局面を評価（キャッシュがあれば使用される）
    const beforeEvalResult = await evaluatePosition(latestState.sfen, 5, 10000);

    // 指し手を適用
    const newBoard = applyUsiMove(board, usiMove);

    // 新しいSFENを生成
    const newSfen = boardToSfen(newBoard);

    // 新しい局面を保存
    const newState = await db.matchState.create({
      data: {
        matchId,
        index: latestState.index + 1,
        sfen: newSfen,
        usiMove: usiMove,
      },
    });

    // 次の手番がAIかどうかを判定
    const nextTurn = newBoard.turn; // applyUsiMoveで既に手番が切り替わっている
    const isAiTurn = nextTurn === "SENTE" ? match.senteType === "AI" : match.goteType === "AI";

    if (isAiTurn) {
      try {
        // 局面を評価（ユーザーが指した後の局面）
        const afterEvalResult = await evaluatePosition(newSfen, 5, 10000);

        // bestmoveコンテンツを作成して溜めておく
        const bestMoveContent: BestMoveContent = {
          type: "bestmove",
          bestmove: afterEvalResult.bestmove,
          variations: afterEvalResult.variations,
          timeMs: afterEvalResult.timeMs,
          engineName: afterEvalResult.engineName,
          sfen: newSfen,
        };

        // 最善手を適用した次の局面を保存
        const newBoardWithAiMove = applyUsiMove(newBoard, afterEvalResult.bestmove);
        const aiMoveIndex = newState.index + 1;
        const aiSfen = boardToSfen(newBoardWithAiMove);

        // AIの指し手での局面を再評価（キャッシュ用）
        evaluatePosition(aiSfen, 5, 10000);

        // プロンプトを生成（評価判定もこの中で行われる）
        const promptText = generateBestMovePrompt({
          beforeSfen: latestState.sfen,
          beforeVariations: beforeEvalResult.variations,
          afterSfen: newSfen,
          afterVariations: afterEvalResult.variations,
          userMove: usiMove,
        });

        console.log(promptText);

        // ストリーミングでメッセージを生成
        const messageContent = { type: "markdown", content: "" };
        const stream = streamChat({
          userMessage: promptText,
          systemPrompt: shogiEvaluationSystemPrompt,
        });

        // DB更新をthrottle（100msごとに1回）
        const throttleInterval = 100;
        let lastUpdateTime = 0;

        for await (const chunk of stream) {
          messageContent.content += chunk;

          const now = Date.now();
          if (now - lastUpdateTime >= throttleInterval) {
            lastUpdateTime = now;
            await db.chatMessage.update({
              where: { id: context.chatMessageId },
              data: { role: "ASSISTANT", contents: [messageContent], isPartial: true },
            });
          }
        }

        // 局面を更新
        const promises = [
          db.matchState.create({
            data: {
              matchId,
              index: aiMoveIndex,
              usiMove: afterEvalResult.bestmove,
              sfen: aiSfen,
              thinkingTime: Math.floor(afterEvalResult.timeMs / 1000),
            },
          }),
          db.chatMessage.update({
            where: { id: context.chatMessageId },
            data: {
              role: "ASSISTANT",
              contents: [messageContent, bestMoveContent],
              isPartial: false,
            },
          }),
        ];

        await Promise.all(promises);
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
  description: description,
  args: ArgsSchema,
  execute,
};
