type Waiter<T> = (item: T | null) => void;

/**
 * Promiseベースのシンプルな非同期キュー
 *
 * USIエンジンの出力ストリームを1行ずつ取り出すために使用する。
 * プロデューサーが行を push し、コンシューマーは get でタイムアウト付きで待機する。
 */
export class AsyncQueue<T> {
  private readonly items: T[] = [];
  private readonly waiters: Waiter<T>[] = [];
  private closed = false;

  /** 末尾に要素を追加する。待機中のコンシューマーがいれば即座に渡す。 */
  push(item: T): void {
    if (this.closed) return;
    const waiter = this.waiters.shift();
    if (waiter) {
      waiter(item);
      return;
    }
    this.items.push(item);
  }

  /** 先頭に要素を戻す。バッファに戻すときに使用する。 */
  pushFront(item: T): void {
    if (this.closed) return;
    const waiter = this.waiters.shift();
    if (waiter) {
      waiter(item);
      return;
    }
    this.items.unshift(item);
  }

  /**
   * 要素を取り出す。存在しなければタイムアウトまで待機する。
   *
   * @param timeoutMs - タイムアウト（ミリ秒）
   * @returns 要素、またはタイムアウト/close済みならnull
   */
  async get(timeoutMs: number): Promise<T | null> {
    if (this.items.length > 0) {
      return this.items.shift() ?? null;
    }
    if (this.closed) return null;

    return new Promise<T | null>((resolve) => {
      const resolver: Waiter<T> = (item) => {
        clearTimeout(timer);
        resolve(item);
      };

      const timer = setTimeout(() => {
        const idx = this.waiters.indexOf(resolver);
        if (idx >= 0) this.waiters.splice(idx, 1);
        resolve(null);
      }, timeoutMs);

      this.waiters.push(resolver);
    });
  }

  /** キューを閉じる。待機中のコンシューマーはnullで解決される。 */
  close(): void {
    if (this.closed) return;
    this.closed = true;
    while (this.waiters.length > 0) {
      const waiter = this.waiters.shift();
      if (waiter) waiter(null);
    }
  }

  /** 現在のバッファサイズ */
  size(): number {
    return this.items.length;
  }
}
