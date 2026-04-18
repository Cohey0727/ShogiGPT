import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { and, asc, desc, eq, gt } from "drizzle-orm";
import { db } from "../db";
import { chatMessages, matchStates } from "../db/schema";
import { toChatMessageDto, toMatchStateDto } from "./helpers";

const POLL_INTERVAL_MS = 400;

/**
 * Server-Sent Events ルート
 *
 * 変更監視はシンプルなDBポーリングで実装（~400ms間隔）。SQLiteは同一プロセスのため
 * ポーリングコストは極めて低い。イベントバス不要でサービス側コードに手を入れずに済む。
 */
export function createSseRoutes(): Hono {
  const app = new Hono();

  /**
   * GET /api/matches/:matchId/messages/stream
   *   初回: 指定matchIdの全メッセージをcreatedAt昇順で送信
   *   以降: updatedAtがlastCursor以降のメッセージを差分送信
   */
  app.get("/api/matches/:matchId/messages/stream", (c) => {
    const matchId = c.req.param("matchId");
    return streamSSE(c, async (stream) => {
      let lastCursor = new Date(0);

      const initial = await db.query.chatMessages.findMany({
        where: eq(chatMessages.matchId, matchId),
        orderBy: asc(chatMessages.createdAt),
      });
      for (const msg of initial) {
        await stream.writeSSE({
          event: "message",
          data: JSON.stringify(toChatMessageDto(msg)),
        });
        if (msg.updatedAt > lastCursor) lastCursor = msg.updatedAt;
      }

      while (!stream.aborted && !stream.closed) {
        await stream.sleep(POLL_INTERVAL_MS);

        const updates = await db.query.chatMessages.findMany({
          where: and(eq(chatMessages.matchId, matchId), gt(chatMessages.updatedAt, lastCursor)),
          orderBy: asc(chatMessages.updatedAt),
        });

        for (const msg of updates) {
          await stream.writeSSE({
            event: "message",
            data: JSON.stringify(toChatMessageDto(msg)),
          });
          if (msg.updatedAt > lastCursor) lastCursor = msg.updatedAt;
        }
      }
    });
  });

  /**
   * GET /api/matches/:matchId/states/stream
   */
  app.get("/api/matches/:matchId/states/stream", (c) => {
    const matchId = c.req.param("matchId");
    return streamSSE(c, async (stream) => {
      let lastIndex = -1;

      const initial = await db.query.matchStates.findMany({
        where: eq(matchStates.matchId, matchId),
        orderBy: asc(matchStates.index),
      });
      for (const state of initial) {
        await stream.writeSSE({
          event: "state",
          data: JSON.stringify(toMatchStateDto(state)),
        });
        if (state.index > lastIndex) lastIndex = state.index;
      }

      while (!stream.aborted && !stream.closed) {
        await stream.sleep(POLL_INTERVAL_MS);

        const updates = await db.query.matchStates.findMany({
          where: and(eq(matchStates.matchId, matchId), gt(matchStates.index, lastIndex)),
          orderBy: asc(matchStates.index),
        });

        for (const state of updates) {
          await stream.writeSSE({
            event: "state",
            data: JSON.stringify(toMatchStateDto(state)),
          });
          if (state.index > lastIndex) lastIndex = state.index;
        }
      }
    });
  });

  /**
   * 指定対局の全状態を返す（参考：ポーリング互換用）
   */
  app.get("/api/matches/:matchId/states", async (c) => {
    const matchId = c.req.param("matchId");
    const states = await db.query.matchStates.findMany({
      where: eq(matchStates.matchId, matchId),
      orderBy: asc(matchStates.index),
    });
    return c.json(states.map(toMatchStateDto));
  });

  /**
   * 指定対局の全メッセージ（降順/昇順トグル可能）
   */
  app.get("/api/matches/:matchId/messages", async (c) => {
    const matchId = c.req.param("matchId");
    const order = c.req.query("order") === "desc" ? "desc" : "asc";
    const messages = await db.query.chatMessages.findMany({
      where: eq(chatMessages.matchId, matchId),
      orderBy: order === "asc" ? asc(chatMessages.createdAt) : desc(chatMessages.createdAt),
    });
    return c.json(messages.map(toChatMessageDto));
  });

  return app;
}
