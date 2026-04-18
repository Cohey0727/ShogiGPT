import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import * as schema from "./schema";

/**
 * SQLiteファイルのパスを解決する。ディレクトリが存在しなければ作成する。
 */
function resolveDbPath(): string {
  const configured = Bun.env.DATABASE_URL ?? "file:./data/shogi.db";
  const path = configured.startsWith("file:") ? configured.slice(5) : configured;
  mkdirSync(dirname(path), { recursive: true });
  return path;
}

const sqlite = new Database(resolveDbPath(), { create: true });
sqlite.exec("PRAGMA journal_mode = WAL");
sqlite.exec("PRAGMA foreign_keys = ON");

/** 共有Drizzleクライアント */
export const db = drizzle(sqlite, { schema });

export { schema };
