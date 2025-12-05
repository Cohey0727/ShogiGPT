import { useMemo, type Dispatch, type SetStateAction } from "react";

import type { z } from "zod/v4";

import { useLocalStorage } from "./useLocalStorage";

/**
 * Zodスキーマのオブジェクトから推論される型
 */
type InferSchemaObject<T extends Record<string, z.ZodType>> = {
  [K in keyof T]: z.infer<T[K]>;
};

/**
 * 型安全なローカルストレージフック
 * @param key ローカルストレージのキー
 * @param schema Zodスキーマのオブジェクト
 * @param initialValue 初期値
 * @returns [値, セッター]
 */
export function useSafeLocalStorage<T extends Record<string, z.ZodType>>(
  key: string,
  schema: T,
  initialValue: InferSchemaObject<T>,
): [InferSchemaObject<T>, Dispatch<SetStateAction<InferSchemaObject<T>>>] {
  const [rawValue, setRawValue] = useLocalStorage<InferSchemaObject<T>>(key, initialValue);

  const safeValue = useMemo(() => {
    if (rawValue === undefined) {
      return initialValue;
    }

    const result: Partial<InferSchemaObject<T>> = {};

    for (const schemaKey of Object.keys(schema) as Array<keyof T>) {
      const fieldSchema = schema[schemaKey];
      const fieldValue = rawValue[schemaKey];
      const parseResult = fieldSchema.safeParse(fieldValue);

      if (parseResult.success) {
        result[schemaKey] = parseResult.data;
      } else {
        result[schemaKey] = initialValue[schemaKey];
      }
    }

    return result as InferSchemaObject<T>;
  }, [rawValue, schema, initialValue]);

  return [safeValue, setRawValue];
}
