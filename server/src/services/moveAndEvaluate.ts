import { z } from "zod";
import type { AiFunctionCallingTool, AiFunctionCallingToolContext } from "./aiFunctionCallingTool";
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

const ArgsSchema = z.object({
  move: z
    .string()
    .describe('指し手（日本語形式）。例: "7六歩", "7六歩(7七)", "5五金打", "2四角成"'),
});

type Args = z.infer<typeof ArgsSchema>;

/**
 * 指定された指し手を実行するツール
 */
async function execute(context: AiFunctionCallingToolContext, args: Args): Promise<string> {
  const { matchId } = context;
  // moveは人間の指し手（日本語形式）
  const { move } = args;

  try {
    // 最新の局面を取得
    const latestState = await db.matchState.findFirst({
      where: { matchId },
      orderBy: { index: "desc" },
    });

    if (!latestState) {
      return `エラー: 対局の局面が見つかりません`;
    }

    // 対局情報を取得
    const match = await db.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return `エラー: 対局が見つかりません`;
    }

    // SFENから盤面を生成
    const board = sfenToBoard(latestState.sfen);

    // 日本語の指し手をUSI形式に変換
    const usiMove = japaneseToUsiMove(move, board);

    if (!usiMove) {
      return `エラー: 指し手「${move}」を解析できませんでした。正しい形式で指定してください。`;
    }

    // 合法手かチェック
    if (!isLegalMove(board, usiMove)) {
      return `エラー: 指し手「${move}」は合法手ではありません。`;
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
      const afterEvalResult = await evaluatePosition(newSfen, 1, 5000);
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
        context.appendMessageContent(bestMoveContent);

        // 最善手を適用した次の局面を保存
        const newBoardWithAiMove = applyUsiMove(newBoard, evaluationResult.bestmove);
        const aiMoveIndex = newState.index + 1;
        const aiSfen = boardToSfen(newBoardWithAiMove);

        context.appendCallbacks(async () => {
          console.log({
            aiMoveIndex,
            usiMove: evaluationResult.bestmove,
          });
          await db.matchState.create({
            data: {
              matchId,
              index: aiMoveIndex,
              usiMove: evaluationResult.bestmove,
              sfen: aiSfen,
              thinkingTime: Math.floor(evaluationResult.timeMs / 1000),
            },
          });
        });

        // AIの指し手での局面を再評価（キャッシュ用）
        evaluatePosition(aiSfen, 5, 10000);

        const aiMoveJapanese = formatMoveToJapanese(evaluationResult.bestmove, newBoard);

        // AIに評価情報と指し手を文字列で返す
        const prompt = generateBestMovePrompt({
          sfen: newSfen,
          bestmove: evaluationResult.bestmove,
          variations: evaluationResult.variations,
        });

        console.log(prompt);

        const lines = [
          `**あなたはこの評価を自分の思考の一部のように使いなさい。**`,
          `【相手の手の評価】`,
          userMoveEvaluation,
          ``,
          `相手の手: ${userMoveJapanese}`,
          `こちらの手: ${aiMoveJapanese}`,
          ``,
          prompt,
        ];

        return lines.join("\n");
      } catch (error) {
        console.error("⚠️ Failed to evaluate position or apply AI move:", error);
        return `ユーザーの手: ${userMoveJapanese}\nAIの思考中にエラーが発生しました。`;
      }
    }

    // AIターンでない場合もユーザーの手の評価を返す
    const lines = [
      `【あなたの手の評価】`,
      userMoveEvaluation,
      ``,
      `あなたの手: ${userMoveJapanese}`,
    ];
    return lines.join("\n");
  } catch (error) {
    console.error("moveAndEvaluate error:", error);
    return `エラー: 指し手の実行中にエラーが発生しました: ${
      error instanceof Error ? error.message : "不明なエラー"
    }`;
  }
}

const description = `指定された指し手を実行し評価します。ユーザーが指し手を指示した場合（「〇〇に△△を進めて」「〇〇歩」など）、必ずこのツールを使用してください。
直接「了解しました」などと答えずに、このツールで実際に盤面を更新してください。日本語形式の指し手（例: "7六歩", "5五金打", "2四角成"）を受け取り、合法性をチェックして盤面に適用します。
またその結果、ユーザーの手の評価情報（評価損失、手の質、候補手順位など）を含む文字列を返します。
`;

export const moveAndEvaluate: AiFunctionCallingTool<typeof ArgsSchema, string> = {
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
