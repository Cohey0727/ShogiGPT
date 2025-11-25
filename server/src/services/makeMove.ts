import { z } from "zod";
import type { AiFunctionCallingTool, AiFunctionCallingToolContext } from "./aiFunctionCallingTool";
import { db } from "../lib/db";
import {
  sfenToBoard,
  japaneseToUsiMove,
  isLegalMove,
  applyUsiMove,
  boardToSfen,
} from "../shared/services";
import { evaluateAndApplyAiMove } from "./evaluateAndApplyAiMove";

const ArgsSchema = z.object({
  move: z
    .string()
    .describe('指し手（日本語形式）。例: "7六歩", "7六歩(7七)", "5五金打", "2四角成"'),
});

type Args = z.infer<typeof ArgsSchema>;

interface Result extends Record<string, unknown> {
  success: boolean;
  message: string;
  usiMove?: string;
  newSfen?: string;
}

/**
 * 指定された指し手を実行するツール
 */
async function execute(context: AiFunctionCallingToolContext, args: Args): Promise<Result> {
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
      return {
        success: false,
        message: `対局ID ${matchId} の局面が見つかりません`,
      };
    }

    // 対局情報を取得
    const match = await db.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return {
        success: false,
        message: `対局ID ${matchId} が見つかりません`,
      };
    }

    // SFENから盤面を生成
    const board = sfenToBoard(latestState.sfen);

    // 日本語の指し手をUSI形式に変換
    const usiMove = japaneseToUsiMove(move, board);

    if (!usiMove) {
      return {
        success: false,
        message: `指し手「${move}」を解析できませんでした。正しい形式で指定してください。`,
      };
    }

    // 合法手かチェック
    if (!isLegalMove(board, usiMove)) {
      return {
        success: false,
        message: `指し手「${move}」(${usiMove})は合法手ではありません。`,
        usiMove,
      };
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

        return {
          success: true,
          message: `指し手「${move}」を実行しました。AIが手を指しました。`,
          usiMove,
          newSfen: aiState?.sfen ?? newSfen,
        };
      } catch (error) {
        console.error("⚠️ Failed to evaluate position or apply AI move:", error);

        // ユーザーの手は成功したので、success: trueを返す
        return {
          success: true,
          message: `指し手「${move}」を実行しましたが、AIの思考中にエラーが発生しました。`,
          usiMove,
          newSfen,
        };
      }
    }

    return {
      success: true,
      message: `指し手「${move}」を実行しました。`,
      usiMove,
      newSfen,
    };
  } catch (error) {
    console.error("makeMove error:", error);
    return {
      success: false,
      message: `指し手の実行中にエラーが発生しました: ${
        error instanceof Error ? error.message : "不明なエラー"
      }`,
    };
  }
}

export const makeMove: AiFunctionCallingTool<typeof ArgsSchema, Result> = {
  name: "make_move",
  description:
    '指定された指し手を実行します。ユーザーが指し手を指示した場合（「〇〇に△△を進めて」「〇〇歩」など）、必ずこのツールを使用してください。直接「了解しました」などと答えずに、このツールで実際に盤面を更新してください。日本語形式の指し手（例: "7六歩", "5五金打", "2四角成"）を受け取り、合法性をチェックして盤面に適用します。',
  args: ArgsSchema,
  execute,
};
