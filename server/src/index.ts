import { graphqlServer } from "@hono/graphql-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { schema } from "./resolvers/schema";
import { client as shogiApiClient } from "./generated/shogi-api/client.gen";

// shogi-apiクライアントの初期化
const shogiApiUrl = Bun.env.SHOGI_API_URL || "http://localhost:8000";
shogiApiClient.setConfig({ baseUrl: shogiApiUrl });
console.log(`🔧 Shogi API client configured: ${shogiApiUrl}`);

const app = new Hono();

// CORS設定 - すべて許可
app.use("/*", cors());

app.get("/", (c) =>
  c.json({
    message: "Shogi backend is running",
    graphqlEndpoint: "/graphql",
    docs: "https://github.com/kohei/shogi-gpt",
  })
);

app.get("/healthz", (c) =>
  c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  })
);

app.use(
  "/graphql",
  graphqlServer({
    schema,
    graphiql: true,
  })
);

const port = Number.parseInt(Bun.env.PORT ?? "8787", 10);

Bun.serve({
  port,
  fetch: app.fetch,
});

console.log(`Hono server ready on http://localhost:${port}`);

export type { Hono } from "hono";
export { app };
