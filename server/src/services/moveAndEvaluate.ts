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
  formatMoveToJapanese,
} from "../shared/services";
import { evaluatePosition } from "../lib/evaluatePosition";
import { generateBestMovePrompt } from "./generateBestMovePrompt";
import type { BestMoveContent } from "../shared/schemas/chatMessage";
import { streamChat } from "../lib/deepseek";
import { shogiEvaluationSystemPrompt } from "./shogiChatConfig";

const ArgsSchema = z.object({
  move: z
    .string()
    .describe('指し手（日本語形式）。例: "7六歩", "7六歩(7七)", "5五金打", "2四角成"'),
});

type Args = z.infer<typeof ArgsSchema>;

/**
 * 指定された指し手を実行するツール
 * AIターンの場合は undefined を返して handoff を示す
 */
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

    // SFENから盤面を生成
    const board = sfenToBoard(latestState.sfen);

    // 日本語の指し手をUSI形式に変換
    const usiMove = japaneseToUsiMove(move, board);

    if (!usiMove) {
      await updateChatMessageWithError(
        chatMessageId,
        `${name}さん、「${move}」を指し手として認識できませんでしたwww`,
      );
      return;
    }

    // 合法手かチェック
    if (!isLegalMove(board, usiMove)) {
      await updateChatMessageWithError(
        chatMessageId,
        `${name}さん、「${move}」は現在の局面では指せない手ですwww`,
      );
      return;
    }

    // ユーザーの手を指す前の局面を評価（キャッシュがあれば使用される）
    const beforeEvalResult = await evaluatePosition(latestState.sfen, 5, 10000);

    // 評価前の候補手を取得
    const beforeVariations = beforeEvalResult.variations as Array<{
      move: string;
      scoreCp: number | null;
      scoreMate: number | null;
    }>;

    // ユーザーの手が候補手にあるかチェック
    const userMoveRank = beforeVariations.findIndex((v) => v.move === usiMove);
    const isInCandidates = userMoveRank !== -1;
    const candidateRank = isInCandidates ? userMoveRank + 1 : null;

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

    // ユーザーの手を日本語で整形
    const userMoveJapanese = formatMoveToJapanese(usiMove, board);

    // ユーザーの手の評価を計算
    // 評価値は手番側から見た値なので、手番が変わると符号を反転して比較
    const beforeScore = beforeVariations[0]?.scoreCp ?? 0;
    const userMoveVariation = beforeVariations.find((v) => v.move === usiMove);
    const userMoveScore = userMoveVariation?.scoreCp ?? null;

    // 評価の損失を計算（最善手との差）
    let evalLoss: number | null = null;
    let moveQuality = "";
    if (userMoveScore !== null) {
      evalLoss = beforeScore - userMoveScore;
      moveQuality = evaluateMoveQuality(evalLoss, candidateRank);
    } else {
      // 候補手にない場合は新しい局面を評価して損失を計算
      const afterEvalResult = await evaluatePosition(newSfen, 5, 5000);
      const afterScore = afterEvalResult.variations[0]?.scoreCp ?? 0;
      // 手番が変わったので符号を反転
      evalLoss = beforeScore - -afterScore;
      moveQuality = evaluateMoveQuality(evalLoss, null);
    }

    // ユーザーの手の評価情報を生成
    const userMoveEvaluation = formatUserMoveEvaluation({
      moveJapanese: userMoveJapanese,
      moveQuality,
      candidateRank,
      bestMove: formatMoveToJapanese(beforeVariations[0]?.move ?? "", board),
    });

    console.log(userMoveEvaluation);

    // 次の手番がAIかどうかを判定
    const nextTurn = newBoard.turn; // applyUsiMoveで既に手番が切り替わっている
    const isAiTurn = nextTurn === "SENTE" ? match.senteType === "AI" : match.goteType === "AI";

    if (isAiTurn) {
      try {
        // 盤面を評価
        const evaluationResult = await evaluatePosition(newSfen, 5, 10000);

        // bestmoveコンテンツを作成して溜めておく
        const bestMoveContent: BestMoveContent = {
          type: "bestmove",
          bestmove: evaluationResult.bestmove,
          variations: evaluationResult.variations,
          timeMs: evaluationResult.timeMs,
          engineName: evaluationResult.engineName,
          sfen: newSfen,
        };

        // 最善手を適用した次の局面を保存
        const newBoardWithAiMove = applyUsiMove(newBoard, evaluationResult.bestmove);
        const aiMoveIndex = newState.index + 1;
        const aiSfen = boardToSfen(newBoardWithAiMove);

        // AIの指し手での局面を再評価（キャッシュ用）
        evaluatePosition(aiSfen, 5, 10000);

        // AIに評価情報と指し手を文字列で返す
        const promptBody = generateBestMovePrompt({
          sfen: newSfen,
          bestmove: evaluationResult.bestmove,
          variations: evaluationResult.variations,
        });

        const lines = [`相手の手: ${userMoveJapanese}`, ``, promptBody];
        const promptText = lines.join("\n");

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

        // 盤面を更新
        const promises = [
          db.matchState.create({
            data: {
              matchId,
              index: aiMoveIndex,
              usiMove: evaluationResult.bestmove,
              sfen: aiSfen,
              thinkingTime: Math.floor(evaluationResult.timeMs / 1000),
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

const description = `指定された指し手を実行し評価します。ユーザーが指し手を指示した場合（「〇〇に△△を進めて」「〇〇歩」など）、必ずこのツールを使用してください。
直接「了解しました」などと答えずに、このツールで実際に盤面を更新してください。日本語形式の指し手（例: "7六歩", "5五金打", "2四角成"）を受け取り、合法性をチェックして盤面に適用します。
またその結果、ユーザーの手の評価情報（評価損失、手の質、候補手順位など）を含む文字列を返します。
`;

export const moveAndEvaluate: HandoffFunctionCallingTool<typeof ArgsSchema> = {
  type: "handoff",
  name: "move_and_evaluate",
  description: description,
  args: ArgsSchema,
  execute,
};

/**
 * 評価損失と候補順位から手の質を判定
 */
function evaluateMoveQuality(evalLoss: number, candidateRank: number | null): string {
  // 最善手の場合
  if (candidateRank === 1) {
    return "最善手";
  }

  // 評価損失に基づいて判定
  if (evalLoss <= 100) {
    return "好手";
  } else if (evalLoss <= 200) {
    return "次善手";
  } else if (evalLoss <= 300) {
    return "普通";
  } else if (evalLoss <= 500) {
    return "疑問手";
  } else if (evalLoss <= 1000) {
    return "悪手";
  } else {
    return "大悪手";
  }
}

/**
 * ユーザーの手の評価情報を文字列に整形
 */
function formatUserMoveEvaluation(params: {
  moveJapanese: string;
  moveQuality: string;
  candidateRank: number | null;
  bestMove: string;
}): string {
  const { moveJapanese, moveQuality, candidateRank, bestMove } = params;

  const lines: string[] = [];

  lines.push(`指し手: ${moveJapanese}`);
  lines.push(`評価: ${moveQuality}`);

  if (candidateRank !== 1 && bestMove) {
    lines.push(`最善手: ${bestMove}`);
  }

  return lines.join("\n");
}
