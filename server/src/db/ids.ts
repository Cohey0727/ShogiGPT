/**
 * ULID風のソート可能ID（ミリ秒タイムスタンプ + ランダム文字列）
 *
 * Prismaのcuid代替。可読性・ソート性・衝突回避を両立。
 */
export function newId(): string {
  const ts = Date.now().toString(36).padStart(9, "0");
  const rand = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  return `${ts}${rand}`;
}
