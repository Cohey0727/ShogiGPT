import { z } from "zod";
import type { AiFunctionCallingTool } from "./aiFunctionCallingTool";
import { createAiToolDefinition } from "./aiFunctionCallingTool";
import { db } from "../lib/db";
import {
  sfenToBoard,
  japaneseToUsiMove,
  isLegalMove,
  applyUsiMove,
  boardToSfen,
} from "../shared/services";

const ArgsSchema = z.object({
  matchId: z.string().describe("対局ID"),
  move: z
    .string()
    .describe(
      '指し手（日本語形式）。例: "7六歩", "7六歩(7七)", "5五金打", "2四角成"'
    ),
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
async function execute(args: Args): Promise<Result> {
  const { matchId, move } = args;

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
    await db.matchState.create({
      data: {
        matchId,
        index: latestState.index + 1,
        sfen: newSfen,
        moveNotation: usiMove,
      },
    });

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

export const makeMoveTool: AiFunctionCallingTool<typeof ArgsSchema, Result> = {
  definition: createAiToolDefinition(
    "make_move",
    '指定された指し手を実行します。ユーザーが「7六に歩を進めて」「5五に金を打って」などと指示した際に使用してください。日本語形式の指し手（例: "7六歩", "5五金打", "2四角成"）を受け取り、合法性をチェックして盤面に適用します。78飛車など間違っている場合は、7八飛車など変換してあげてください。',
    ArgsSchema
  ),
  argsSchema: ArgsSchema,
  execute,
};
