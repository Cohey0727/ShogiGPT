import { makeExecutableSchema } from "@graphql-tools/schema";
import { graphqlServer } from "@hono/graphql-server";
import { Hono } from "hono";

const app = new Hono();

const typeDefs = `#graphql
  type Query {
    serverInfo: ServerInfo!
  }

  type ServerInfo {
    name: String!
    status: String!
    version: String!
    timestamp: String!
  }
`;

const resolvers = {
  Query: {
    serverInfo: () => ({
      name: "ShogiGPT",
      status: "ok",
      version: Bun.env.APP_VERSION ?? "0.0.0",
      timestamp: new Date().toISOString(),
    }),
  },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

app.get("/", (c) =>
  c.json({
    message: "Shogi backend is running",
    graphqlEndpoint: "/graphql",
    docs: "https://github.com/kohei/shogi-web",
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
