import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { db } from "./client";

/**
 * サーバ起動時にSQLiteマイグレーションを適用する
 */
export function runMigrations(): void {
  migrate(db, { migrationsFolder: "./src/db/migrations" });
}
