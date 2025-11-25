import type { EvaluateMatchStateResult, MutationResolvers } from "../../generated/graphql/types";
import { db } from "../../lib/db";
import { evaluateAndApplyAiMove } from "../../services/evaluateAndApplyAiMove";

/**
 * 既に保存されたMatchStateに対して非同期で盤面評価を行う
 */
export const evaluateMatchState: MutationResolvers["evaluateMatchState"] = async (
  _parent,
  { input },
) => {
  // MatchStateを取得して評価結果を返す準備
  const matchState = await db.matchState.findUnique({
    where: { matchId_index: { matchId: input.matchId, index: input.index } },
  });

  if (!matchState) {
    throw new Error(`MatchState not found: ${input.matchId}, index: ${input.index}`);
  }

  // 評価と最善手の適用を実行
  await evaluateAndApplyAiMove({
    matchId: input.matchId,
    index: input.index,
    multipv: input.multipv ?? 5,
    thinkingTime: input.thinkingTime ?? undefined,
    applyBestMove: input.applyBestMove ?? false,
  });

  // 評価後のMatchStateを取得して結果を返す
  const updatedMatchState = await db.matchState.findUnique({
    where: { matchId_index: { matchId: input.matchId, index: input.index } },
    include: { evaluation: true },
  });

  if (!updatedMatchState?.evaluation) {
    throw new Error("Evaluation failed");
  }

  const variations = updatedMatchState.evaluation.variations as Array<{
    move: string;
    scoreCp: number | null;
    scoreMate: number | null;
    depth: number;
    nodes: number;
    pv: string[];
  }>;

  // BestMoveContent形式で返す
  return {
    type: "bestmove",
    bestmove: variations[0]?.move ?? "",
    variations,
    timeMs: 0, // キャッシュから取得する可能性があるため、実際の時間は不明
    engineName: updatedMatchState.evaluation.engineName,
    sfen: matchState.sfen,
  } satisfies EvaluateMatchStateResult;
};
