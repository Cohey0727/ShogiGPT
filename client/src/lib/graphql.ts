import {
  cacheExchange,
  createClient,
  fetchExchange,
  subscriptionExchange,
} from "urql";
import { createClient as createWSClient } from "graphql-ws";

/**
 * GraphQLエンドポイントのURLを正規化する
 * スキーマやドメインがない場合（例: :7777/v1/graphql）は現在のドメインで補完する
 */
function complementUrl(url: string): string {
  // 完全なURLの場合はそのまま返す
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // 現在のプロトコルを取得（デフォルトはhttp）
  const protocol =
    typeof window !== "undefined" ? window.location.protocol : "http:";

  // 現在のホスト名を取得（デフォルトはlocalhost）
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "localhost";

  // ポートとパスのみの場合（:で始まる）
  if (url.startsWith(":")) {
    return `${protocol}//${hostname}${url}`;
  }

  // パスのみの場合（/で始まる）
  if (url.startsWith("/")) {
    return `${protocol}//${hostname}${url}`;
  }

  // それ以外の場合はそのまま返す（フォールバック）
  return url;
}

const GRAPHQL_ENDPOINT = complementUrl(
  import.meta.env.VITE_GRAPHQL_ENDPOINT || "http://localhost:7777/v1/graphql"
);
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
  suspense: true,
});
