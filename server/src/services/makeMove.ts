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
import { evaluateAndApplyAiMove } from "./evaluateAndApplyAiMove";

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

    // 次の手番がAIかどうかを判定
    const nextTurn = newBoard.turn; // applyUsiMoveで既に手番が切り替わっている
    const isAiTurn = nextTurn === "SENTE" ? match.senteType === "AI" : match.goteType === "AI";

    if (isAiTurn) {
      try {
        await evaluateAndApplyAiMove({
          matchId,
          index: newState.index,
          multipv: 5,
          thinkingTime: 10,
          applyBestMove: true,
        });

        // AI手適用後の最新局面を取得
        const aiState = await db.matchState.findFirst({
          where: { matchId },
          orderBy: { index: "desc" },
        });

        if (aiState?.usiMove) {
          // AIの手を日本語で整形
          const aiMoveJapanese = formatMoveToJapanese(aiState.usiMove, newBoard);
          return `ユーザーの手: ${userMoveJapanese}に対して、こちらの手: ${aiMoveJapanese}`;
        }

        return `ユーザーの手: ${userMoveJapanese}\nAIの手: （取得できませんでした）`;
      } catch (error) {
        console.error("⚠️ Failed to evaluate position or apply AI move:", error);
        return `ユーザーの手: ${userMoveJapanese}\nAIの思考中にエラーが発生しました。`;
      }
    }

    return `ユーザーの手: ${userMoveJapanese}`;
  } catch (error) {
    console.error("makeMove error:", error);
    return `エラー: 指し手の実行中にエラーが発生しました: ${
      error instanceof Error ? error.message : "不明なエラー"
    }`;
  }
}

export const makeMove: AiFunctionCallingTool<typeof ArgsSchema, string> = {
  name: "make_move",
  description:
    '指定された指し手を実行します。ユーザーが指し手を指示した場合（「〇〇に△△を進めて」「〇〇歩」など）、必ずこのツールを使用してください。直接「了解しました」などと答えずに、このツールで実際に盤面を更新してください。日本語形式の指し手（例: "7六歩", "5五金打", "2四角成"）を受け取り、合法性をチェックして盤面に適用します。',
  args: ArgsSchema,
  execute,
};
