import type { EnginePoolConfig } from "./types";

/**
 * 環境変数からエンジンプール設定を読み込む
 *
 * 総メモリ目安: poolSize * (USI_Hash + ~50MB) + 100MB
 */
export function loadEnginePoolConfig(): EnginePoolConfig {
  const ENGINE_PATH = Bun.env.ENGINE_PATH ?? "/engine/YaneuraOu";
  const ENGINE_CWD = Bun.env.ENGINE_CWD ?? "/engine";
  const ENGINE_POOL_SIZE = Number.parseInt(Bun.env.ENGINE_POOL_SIZE ?? "4", 10);
  const ENGINE_USI_HASH_MB = Number.parseInt(Bun.env.ENGINE_USI_HASH_MB ?? "16", 10);
  const ENGINE_THREADS = Number.parseInt(Bun.env.ENGINE_THREADS ?? "1", 10);

  return {
    enginePath: ENGINE_PATH,
    engineCwd: ENGINE_CWD,
    poolSize: ENGINE_POOL_SIZE,
    options: {
      USI_Hash: String(ENGINE_USI_HASH_MB),
      USI_Ponder: "false",
      Threads: String(ENGINE_THREADS),
    },
  };
}
