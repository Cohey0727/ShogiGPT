import type { QueryResolvers } from "../../generated/graph/types";
import { analyzePositionAnalyzePost } from "../../generated/shogi-api";

export const analyzePosition: QueryResolvers["analyzePosition"] = async (
  _,
  { input }
) => {
  // GraphQL Input (camelCase) → OpenAPI Request (snake_case)
  const { data, error } = await analyzePositionAnalyzePost({
    body: {
      sfen: input.sfen ?? undefined,
      moves: input.moves ?? undefined,
      time_ms: input.timeMs ?? undefined,
      depth: input.depth ?? undefined,
      multipv: input.multipv ?? undefined,
    },
  });

  if (error || !data) {
    throw new Error(
      `Failed to analyze position: ${
        error ? JSON.stringify(error) : "No data returned"
      }`
    );
  }

  // OpenAPI Response (snake_case) → GraphQL Result (camelCase)
  return {
    bestmove: data.bestmove,
    variations: data.variations.map((v) => ({
      move: v.move,
      scoreCp: v.score_cp ?? null,
      scoreMate: v.score_mate ?? null,
      depth: v.depth,
      nodes: v.nodes ?? null,
      pv: v.pv ?? null,
    })),
    timeMs: data.time_ms,
    engineName: data.engine_name,
  };
};
