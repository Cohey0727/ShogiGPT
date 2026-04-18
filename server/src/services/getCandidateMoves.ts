import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { matchStates } from "../db/schema";
import type {
  InlineFunctionCallingTool,
  AiFunctionCallingToolContext,
} from "./aiFunctionCallingTool";
import { getShogiAiPool } from "../lib/shogiAi";
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

  const latestState = await db.query.matchStates.findFirst({
    where: eq(matchStates.matchId, matchId),
    orderBy: desc(matchStates.index),
  });

  if (!latestState) {
    throw new Error(`対局ID ${matchId} の局面が見つかりません`);
  }

  const pool = getShogiAiPool();
  const data = await pool.analyze({
    sfen: latestState.sfen,
    multipv: 5,
    timeMs: 3000,
    moves: null,
    depth: null,
  });

  const sfenParts = latestState.sfen.split(" ");
  const currentTurn = sfenParts[1] === "b" ? "先手" : "後手";

  let board: Board | undefined;
  try {
    board = sfenToBoard(latestState.sfen);
  } catch (error) {
    console.error("Failed to parse SFEN:", error);
  }

  const candidates: CandidateMove[] = data.variations.map((v) => ({
    move: v.move,
    moveJapanese: formatMoveToJapanese(v.move, board),
    scoreCp: v.scoreCp ?? null,
    scoreMate: v.scoreMate ?? null,
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

export const getCandidateMoves: InlineFunctionCallingTool<typeof ArgsSchema> = {
  type: "inline",
  name: "get_candidate_moves",
  description:
    "現在の局面における候補手と評価値を取得します。将棋に関する質問（候補手、次の手、局面評価など）には必ずこのツールを使用して正確な情報を取得してください。推測や想像で答えてはいけません。",
  args: ArgsSchema,
  execute: async (context) => {
    const result = await execute(context);
    return JSON.stringify(result, null, 2);
  },
};
