import { Hono } from "hono";
import type { UsiEnginePool } from "./enginePool";
import { analyzeRequestSchema, mateSearchRequestSchema } from "./schemas";

/** shogi-ai 用のHonoルーターを作成する */
export function createShogiAiRoutes(pool: UsiEnginePool): Hono {
  const app = new Hono();

  app.get("/health", (c) => {
    if (pool.isHealthy()) {
      return c.json({ status: "healthy", engine: "ready" }, 200);
    }
    return c.json({ status: "unhealthy", engine: "not ready" }, 503);
  });

  app.get("/engine/info", (c) => {
    const info = pool.getEngineInfo();
    return c.json({
      name: info.name,
      author: info.author,
      version: info.version,
      options: info.options,
    });
  });

  app.post("/analyze", async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const parsed = analyzeRequestSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ detail: parsed.error.issues }, 422);
    }

    try {
      const result = await pool.analyze({
        sfen: parsed.data.sfen,
        moves: parsed.data.moves,
        timeMs: parsed.data.time_ms,
        depth: parsed.data.depth,
        multipv: parsed.data.multipv,
      });

      return c.json({
        bestmove: result.bestmove,
        variations: result.variations.map((v) => ({
          move: v.move,
          score_cp: v.scoreCp,
          score_mate: v.scoreMate,
          depth: v.depth,
          nodes: v.nodes,
          pv: v.pv,
        })),
        time_ms: result.timeMs,
        engine_name: result.engineName,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Analysis failed";
      console.error("Analysis error:", message);
      return c.json({ detail: `Analysis failed: ${message}` }, 500);
    }
  });

  app.post("/mate", async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const parsed = mateSearchRequestSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ detail: parsed.error.issues }, 422);
    }

    try {
      const result = await pool.searchMate({
        sfen: parsed.data.sfen,
        moves: parsed.data.moves,
        timeMs: parsed.data.time_ms,
      });
      return c.json({
        mate_found: result.mateFound,
        mate_moves: result.mateMoves ?? null,
        mate_length: result.mateLength ?? null,
        message: result.message ?? null,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Mate search failed";
      console.error("Mate search error:", message);
      return c.json({ detail: `Mate search failed: ${message}` }, 500);
    }
  });

  return app;
}
