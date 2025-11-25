"use client";
import { useMemo, useRef } from "react";
import type { RefObject } from "react";

type Key = string | number | symbol;

type RefsObject<T, K extends Key> = {
  [key in K]: RefObject<T>;
};

/**
 * 複数のRefを動的に管理するためのカスタムフック
 *
 * @description
 * - 動的なキーを使用して複数のRefを管理する
 * - Proxyを使用してRefの追加と参照を自動化する
 * - 各Refは値の設定と現在値の参照が可能
 *
 * @param initialValue - Refの初期値を持つオブジェクト
 * @returns キーに対応するRef操作用のProxy
 *
 * @example
 * ```tsx
 * const refs = useRefs<HTMLDivElement, 'foo' | 'bar'>();
 * return <div ref={refs.foo} />;
 * ```
 */
export function useRefs<T, K extends Key = Key>(initialValue?: Record<K, T>): RefsObject<T, K> {
  const refs = useRef<Record<K, T>>(initialValue ?? ({} as Record<K, T>));

  return useMemo(() => {
    return new Proxy(
      {},
      // eslint-disable-next-line react-hooks/refs
      {
        get(_, prop) {
          const setter = (value: T) => {
            refs.current[prop as K] = value;
          };
          setter.current = refs.current[prop as K] ?? null;
          return setter as RefObject<T>;
        },
      },
    ) as RefsObject<T, K>;
  }, []);
}
