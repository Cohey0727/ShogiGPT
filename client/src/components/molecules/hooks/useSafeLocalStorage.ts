import { useCallback, useMemo, type Dispatch, type SetStateAction } from "react";

import type { z } from "zod/v4";

import { useLocalStorage } from "./useLocalStorage";

/**
 * 型安全なローカルストレージフック（defaultValue指定あり）
 * @param key ローカルストレージのキー
 * @param schema Zodスキーマ
 * @param defaultValue 初期値
 * @returns [値, セッター]
 */
export function useSafeLocalStorage<T extends z.ZodType>(
  key: string,
  schema: T,
  defaultValue: z.infer<T>,
): [z.infer<T>, Dispatch<SetStateAction<z.infer<T>>>];

/**
 * 型安全なローカルストレージフック（defaultValue省略）
 * @param key ローカルストレージのキー
 * @param schema Zodスキーマ
 * @returns [値 | undefined, セッター]
 */
export function useSafeLocalStorage<T extends z.ZodType>(
  key: string,
  schema: T,
): [z.infer<T> | undefined, Dispatch<SetStateAction<z.infer<T> | undefined>>];

/**
 * 型安全なローカルストレージフック実装
 */
export function useSafeLocalStorage<T extends z.ZodType>(
  key: string,
  schema: T,
  defaultValue?: z.infer<T>,
): [z.infer<T> | undefined, Dispatch<SetStateAction<z.infer<T> | undefined>>] {
  const [rawValue, setRawValue] = useLocalStorage<z.infer<T> | undefined>(key, defaultValue);

  const safeValue = useMemo(() => {
    if (rawValue === undefined) {
      return defaultValue;
    }

    const parseResult = schema.safeParse(rawValue);

    if (parseResult.success) {
      return parseResult.data as z.infer<T>;
    }

    return defaultValue;
  }, [rawValue, schema, defaultValue]);

  const setSafeValue: Dispatch<SetStateAction<z.infer<T> | undefined>> = useCallback(
    (action) => {
      setRawValue((prev) => {
        const nextValue =
          typeof action === "function"
            ? (action as (prev: z.infer<T> | undefined) => z.infer<T> | undefined)(prev)
            : action;

        if (nextValue === undefined) {
          return undefined;
        }

        return schema.parse(nextValue);
      });
    },
    [setRawValue, schema],
  );

  return [safeValue, setSafeValue];
}
