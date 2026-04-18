import { UsiEnginePool } from "./enginePool";
import { loadEnginePoolConfig } from "./config";

let pool: UsiEnginePool | null = null;
let initializingPromise: Promise<UsiEnginePool> | null = null;

/**
 * 共有エンジンプールを初期化する
 *
 * アプリケーション起動時に1回だけ呼び出す。2回目以降は既存のインスタンスを返す。
 */
export async function initShogiAiPool(): Promise<UsiEnginePool> {
  if (pool) return pool;
  if (initializingPromise) return initializingPromise;

  initializingPromise = (async () => {
    const config = loadEnginePoolConfig();
    console.log(
      `🏯 Initializing YaneuraOu engine pool ` +
        `(poolSize=${config.poolSize}, hash=${config.options.USI_Hash}MB, threads=${config.options.Threads})...`,
    );
    const created = new UsiEnginePool(config);
    await created.initialize();
    pool = created;
    console.log("🏯 Engine pool ready!");
    return created;
  })();

  return initializingPromise;
}

/**
 * 共有エンジンプールを取得する。未初期化の場合はエラーを投げる。
 */
export function getShogiAiPool(): UsiEnginePool {
  if (!pool) {
    throw new Error("Shogi AI engine pool is not initialized. Call initShogiAiPool() first.");
  }
  return pool;
}

/** 共有エンジンプールを停止する */
export async function shutdownShogiAiPool(): Promise<void> {
  if (!pool) return;
  const toShutdown = pool;
  pool = null;
  initializingPromise = null;
  await toShutdown.shutdown();
}
