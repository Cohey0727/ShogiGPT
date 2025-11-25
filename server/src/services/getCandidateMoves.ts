import { z } from "zod";
import type { AiFunctionCallingTool, AiFunctionCallingToolContext } from "./aiFunctionCallingTool";
import { db } from "../lib/db";
import { analyzePositionAnalyzePost } from "../generated/shogi-ai";
import { formatMoveToJapanese, sfenToBoard } from "../shared/services";
import type { Board } from "../shared/consts/shogi";
import { sfenToAscii } from "../shared/services/sfenToAscii";

const ArgsSchema = z.object({});

interface CandidateMove {
  move: string;
  moveJapanese: string;
  scoreCp: number | null;
  scoreMate: number | null;
  depth: number;
  nodes: number | null;
  pv: string[] | null;
}

interface Result extends Record<string, unknown> {
  board: string;
  currentTurn: "先手" | "後手";
  candidates: CandidateMove[];
}

/**
 * 現在の局面の候補手を取得するツール
 */
async function execute(context: AiFunctionCallingToolContext): Promise<Result> {
  const { matchId } = context;

  // 最新の局面を取得
  const latestState = await db.matchState.findFirst({
    where: { matchId },
    orderBy: { index: "desc" },
  });

  if (!latestState) {
    throw new Error(`対局ID ${matchId} の局面が見つかりません`);
  }

  // 盤面を解析して候補手を取得
  const { data, error } = await analyzePositionAnalyzePost({
    body: {
      sfen: latestState.sfen,
      multipv: 5,
      time_ms: 3000,
      moves: null,
      depth: null,
    },
  });

  if (error || !data) {
    throw new Error("候補手の取得に失敗しました");
  }

  // 手番を判定（SFENの2番目のフィールド: 'b' = 先手, 'w' = 後手）
  const sfenParts = latestState.sfen.split(" ");
  const currentTurn = sfenParts[1] === "b" ? "先手" : "後手";

  // 盤面情報を取得（駒名表示のため）
  let board: Board | undefined;
  try {
    board = sfenToBoard(latestState.sfen);
  } catch (error) {
    console.error("Failed to parse SFEN:", error);
    // 盤面解析に失敗しても続行
  }

  // 日本語の指し手表記を生成
  const candidates: CandidateMove[] = data.variations.map((v) => ({
    move: v.move,
    moveJapanese: formatMoveToJapanese(v.move, board),
    scoreCp: v.score_cp ?? null,
    scoreMate: v.score_mate ?? null,
    depth: v.depth,
    nodes: v.nodes ?? null,
    pv: v.pv ?? null,
  }));
  return {
    board: sfenToAscii(latestState.sfen),
    currentTurn,
    candidates,
  };
}

export const getCandidateMoves: AiFunctionCallingTool<typeof ArgsSchema, Result> = {
  name: "get_candidate_moves",
  description:
    "現在の局面における候補手と評価値を取得します。将棋に関する質問（候補手、次の手、局面評価など）には必ずこのツールを使用して正確な情報を取得してください。推測や想像で答えてはいけません。",
  args: ArgsSchema,
  execute,
};
