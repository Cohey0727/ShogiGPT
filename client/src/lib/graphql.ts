import {
  cacheExchange,
  createClient,
  fetchExchange,
  subscriptionExchange,
} from "urql";
import { createClient as createWSClient } from "graphql-ws";

const GRAPHQL_ENDPOINT =
  import.meta.env.VITE_GRAPHQL_ENDPOINT || "http://localhost:7777/v1/graphql";
const GRAPHQL_WS_ENDPOINT = GRAPHQL_ENDPOINT.replace(/^http/, "ws");

const wsClient = createWSClient({
  url: GRAPHQL_WS_ENDPOINT,
});

export const client = createClient({
  url: GRAPHQL_ENDPOINT,
  exchanges: [
    cacheExchange,
    fetchExchange,
    subscriptionExchange({
      forwardSubscription(request) {
        const input = { ...request, query: request.query || "" };
        return {
          subscribe(sink) {
            const unsubscribe = wsClient.subscribe(input, sink);
            return { unsubscribe };
          },
        };
      },
    }),
  ],
  fetchOptions: { headers: { "Content-Type": "application/json" } },
  preferGetMethod: false,
});
