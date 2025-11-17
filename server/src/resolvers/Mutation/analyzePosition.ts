import type { MutationResolvers } from "../../generated/graphql/types";
import { analyzePositionAnalyzePost } from "../../generated/shogi-api";

export const analyzePosition: MutationResolvers["analyzePosition"] = async (
  _,
  { input }
) => {
  console.log("📥 analyzePosition mutation called");
  console.log("  SFEN:", input.sfen ?? "default initial position");
  console.log("  Moves:", input.moves ?? "none");
  console.log("  Time:", input.timeMs ?? "default", "ms");
  console.log("  Depth:", input.depth ?? "not set");
  console.log("  MultiPV:", input.multipv ?? 1);

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
    console.error("❌ shogi-api error:", error);
    throw new Error(
      `Failed to analyze position: ${
        error ? JSON.stringify(error) : "No data returned"
      }`
    );
  }

  console.log("✅ shogi-api response:");
  console.log("  Best move:", data.bestmove);
  console.log("  Engine:", data.engine_name);
  console.log("  Time:", data.time_ms, "ms");
  console.log("  Variations:", data.variations.length);

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
