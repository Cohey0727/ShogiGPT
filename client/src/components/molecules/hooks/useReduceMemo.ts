import type { DependencyList } from "react";
import { useMemo, useRef } from "react";

/**
 * 直前のメモ化された値を参照しながら新しい値を計算するhook
 *
 * @description
 * useMemoと同様に依存配列が変化したときのみ再計算を行うが、
 * factory関数に前回の値が渡されるため、累積的な計算が可能。
 * Streaming Subscriptionで新しいデータを既存データにマージする場合などに有用。
 *
 * @param factory - 前回の値を受け取り、新しい値を返す関数。初回はundefinedが渡される。
 * @param deps - 依存配列。変化時にfactoryが再実行される。
 * @returns メモ化された値
 */
export function useReduceMemo<T>(factory: (prev: T | undefined) => T, deps: DependencyList): T {
  const ref = useRef<T | undefined>(undefined);
  return useMemo(() => {
    const next = factory(ref.current);
    ref.current = next;
    return next;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
