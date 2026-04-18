/**
 * Suspense対応の最小クエリキャッシュ
 *
 * urqlの `suspense: true` 相当の挙動を提供する：
 * - データ未到着 → Promise を throw（React Suspense が捕捉）
 * - 取得済み → データを返す
 * - エラー → エラーを throw
 */

interface Entry<T> {
  promise?: Promise<void>;
  data?: T;
  error?: unknown;
  fetchedAt: number;
}

const cache = new Map<string, Entry<unknown>>();

/**
 * キャッシュに無ければfetcherを呼び、Suspense向けにthrowする。
 */
export function runSuspense<T>(key: string, fetcher: () => Promise<T>): T {
  let entry = cache.get(key) as Entry<T> | undefined;

  if (!entry) {
    entry = { fetchedAt: Date.now() };
    cache.set(key, entry as Entry<unknown>);
    entry.promise = fetcher().then(
      (data) => {
        entry!.data = data;
        entry!.promise = undefined;
      },
      (error: unknown) => {
        entry!.error = error;
        entry!.promise = undefined;
      },
    );
  }

  if (entry.error) throw entry.error;
  if (entry.promise) throw entry.promise;
  return entry.data as T;
}

/**
 * キャッシュをクリアして強制的に再取得させる。
 */
export function invalidate(key: string): void {
  cache.delete(key);
}

/**
 * 指定プレフィックスに一致するキーを全てクリア
 */
export function invalidatePrefix(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}
