import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

/**
 * 対局状況
 */
export const matchStatuses = ["ONGOING", "COMPLETED", "ABANDONED"] as const;
export type MatchStatus = (typeof matchStatuses)[number];

/**
 * プレイヤータイプ
 */
export const playerTypes = ["HUMAN", "AI"] as const;
export type PlayerType = (typeof playerTypes)[number];

/**
 * プレイヤー（先手/後手）
 */
export const matchPlayers = ["SENTE", "GOTE"] as const;
export type MatchPlayer = (typeof matchPlayers)[number];

/**
 * メッセージの送信者ロール
 */
export const messageRoles = ["USER", "ASSISTANT"] as const;
export type MessageRole = (typeof messageRoles)[number];

/**
 * 対局情報
 */
export const matches = sqliteTable(
  "matches",
  {
    id: text("id").primaryKey(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    status: text("status", { enum: matchStatuses }).notNull().default("ONGOING"),
    playerSente: text("player_sente"),
    playerGote: text("player_gote"),
    senteType: text("sente_type", { enum: playerTypes }).notNull().default("HUMAN"),
    goteType: text("gote_type", { enum: playerTypes }).notNull().default("HUMAN"),
  },
  (table) => [
    index("matches_created_at_idx").on(table.createdAt),
    index("matches_status_idx").on(table.status),
  ],
);

/**
 * 対局AI設定
 */
export const matchAiConfigs = sqliteTable(
  "match_ai_configs",
  {
    id: text("id").primaryKey(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    matchId: text("match_id")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    player: text("player", { enum: matchPlayers }).notNull(),
    engineName: text("engine_name"),
    thinkTime: integer("think_time"),
    depth: integer("depth"),
    multiPv: integer("multi_pv"),
    personality: text("personality"),
  },
  (table) => [
    uniqueIndex("match_ai_configs_match_player_uq").on(table.matchId, table.player),
    index("match_ai_configs_match_idx").on(table.matchId),
  ],
);

/**
 * 局面情報（ある時点での局面状態と、そこに至った指し手）
 */
export const matchStates = sqliteTable(
  "match_states",
  {
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    matchId: text("match_id")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    index: integer("index").notNull(),
    usiMove: text("usi_move").notNull(),
    sfen: text("sfen").notNull(),
    thinkingTime: integer("thinking_time"),
  },
  (table) => [primaryKey({ columns: [table.matchId, table.index] })],
);

/**
 * チャットメッセージ
 *
 * contents/metadataはJSONをTEXTで保存する
 */
export const chatMessages = sqliteTable(
  "chat_messages",
  {
    id: text("id").primaryKey(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    matchId: text("match_id")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    role: text("role", { enum: messageRoles }).notNull(),
    contents: text("contents", { mode: "json" }).notNull().$type<unknown>(),
    isPartial: integer("is_partial", { mode: "boolean" }).notNull().default(false),
    metadata: text("metadata"),
  },
  (table) => [
    index("chat_messages_match_idx").on(table.matchId),
    index("chat_messages_created_at_idx").on(table.createdAt),
  ],
);

/**
 * 評価結果キャッシュ
 */
export const evaluations = sqliteTable(
  "evaluations",
  {
    id: text("id").primaryKey(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    sfen: text("sfen").notNull(),
    engineName: text("engine_name").notNull(),
    score: integer("score").notNull(),
    variations: text("variations", { mode: "json" }).notNull().$type<unknown>(),
  },
  (table) => [
    uniqueIndex("evaluations_sfen_engine_uq").on(table.sfen, table.engineName),
    index("evaluations_sfen_idx").on(table.sfen),
    index("evaluations_engine_idx").on(table.engineName),
  ],
);

// ============================================================
// Relations
// ============================================================

export const matchesRelations = relations(matches, ({ many }) => ({
  states: many(matchStates),
  messages: many(chatMessages),
  aiConfigs: many(matchAiConfigs),
}));

export const matchStatesRelations = relations(matchStates, ({ one }) => ({
  match: one(matches, { fields: [matchStates.matchId], references: [matches.id] }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  match: one(matches, { fields: [chatMessages.matchId], references: [matches.id] }),
}));

export const matchAiConfigsRelations = relations(matchAiConfigs, ({ one }) => ({
  match: one(matches, { fields: [matchAiConfigs.matchId], references: [matches.id] }),
}));

// ============================================================
// Inferred types
// ============================================================

export type Match = typeof matches.$inferSelect;
export type NewMatch = typeof matches.$inferInsert;
export type MatchState = typeof matchStates.$inferSelect;
export type NewMatchState = typeof matchStates.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;
export type Evaluation = typeof evaluations.$inferSelect;
export type NewEvaluation = typeof evaluations.$inferInsert;
export type MatchAiConfig = typeof matchAiConfigs.$inferSelect;
export type NewMatchAiConfig = typeof matchAiConfigs.$inferInsert;
