import { Hono } from "hono";
import { cors } from "hono/cors";
import { runMigrations } from "./db/migrator";
import { createShogiAiRoutes, initShogiAiPool, shutdownShogiAiPool } from "./lib/shogiAi";
import { createMatchRoutes } from "./routes/matches";
import { createSseRoutes } from "./routes/sse";

// SQLiteマイグレーション適用（冪等）
runMigrations();

const app = new Hono();

app.use("/*", cors());

app.get("/", (c) =>
  c.json({
    message: "Shogi backend is running",
    endpoints: "/api/matches, /analyze, /mate, /engine/info",
  }),
);

app.get("/healthz", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

// REST + SSE
app.route("/", createMatchRoutes());
app.route("/", createSseRoutes());

// 将棋エンジンプール起動と shogi-ai ルート(/analyze, /mate, /engine/info, /health)
const pool = await initShogiAiPool();
app.route("/", createShogiAiRoutes(pool));

const port = Number.parseInt(Bun.env.PORT ?? "8787", 10);

const server = Bun.serve({
  port,
  fetch: app.fetch,
  idleTimeout: 0, // SSE長時間接続のためtimeout無効化
});

console.log(`Hono server ready on http://localhost:${port}`);

const shutdown = async (signal: string): Promise<void> => {
  console.log(`${signal} received, shutting down...`);
  server.stop();
  await shutdownShogiAiPool();
  process.exit(0);
};

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

export type { Hono } from "hono";
export { app };
