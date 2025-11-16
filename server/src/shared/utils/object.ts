import type { PathOf } from "./types";

/**
 * オブジェクトのキーの配列を返します。この関数はキーの型を保存します。
 * @param obj キーを取得するオブジェクト。
 * @returns オブジェクトのキーを表す文字列の配列。キーの型は元のオブジェクトのものを保持します。
 */
export function objectKeys<T extends object>(obj: T) {
  return Object.keys(obj) as (keyof T)[];
}

/**
 * オブジェクトの値の配列を返します。この関数は値の型を保存します。
 * @param obj 値を取得するオブジェクト。
 * @returns オブジェクトの各キーに対応する値の配列。各値の型は元のオブジェクトのキーに対応する型を保持します。
 */
export function objectValues<T extends object>(obj: T) {
  return Object.values(obj) as T[keyof T][];
}

/**
 * オブジェクトのエントリー（キーと値のペア）の配列を返します。この関数はキーと値の型を保存します。
 * @param obj エントリーを取得するオブジェクト。
 * @returns オブジェクトの各エントリーを表すタプル（[キー, 値]）の配列。キーと値の型は元のオブジェクトのものを保持します。
 */
export function objectEntries<T extends object>(obj: T) {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
}

/**
 * 指定したオブジェクトから、与えられたパスに対応する値を取得します。
 *
 * @template T - 検索対象となるオブジェクトの型。
 * @template R - 取得する値の型（デフォルトは any）。
 * @param obj - 検索対象となるオブジェクト。
 * @param path - オブジェクト内での値のパス（'.'区切りの文字列）。
 * @returns 指定したパスに対応する値。存在しない場合は undefined。
 *
 * @example
 * const obj = { a: { b: { c: 42 } } };
 * const result = getFromPath(obj, 'a.b.c');  // 42
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getFromPath<T, R = any>(
  obj: T,
  path: PathOf<T>
): R | undefined {
  const pathList = path.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let res: any = obj;
  for (const path of pathList) {
    if (res === undefined || res === null) {
      return undefined;
    }
    res = res[path];
  }
  return res as R | undefined;
}

/**
 * 指定したオブジェクトに、与えられたパスに対応する値を代入します。
 *
 * @template T - 更新対象となるオブジェクトの型。
 * @template R - 設定する値の型（デフォルトは any）。
 * @param obj - 更新対象となるオブジェクト。
 * @param path - オブジェクト内での値のパス（'.'区切りの文字列）。
 * @param value - 設定する値。
 *
 * @example
 * const obj = { a: { b: { c: 42 } } };
 * setFromPath(obj, 'a.b.c', 100);  // obj = { a: { b: { c: 100 } } } となる
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setFromPath<T, R = any>(
  obj: T,
  path: PathOf<T>,
  value: R
): void {
  const pathList = path.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = obj;
  for (let i = 0; i < pathList.length; i++) {
    const key = pathList[i];
    if (i === pathList.length - 1) {
      current[key] = value;
      return;
    }

    if (
      typeof current[key] !== "object" ||
      current[key] === null ||
      current[key] === undefined
    ) {
      current[key] = {};
    }

    current = current[key];
  }
}

/**
 * 値がプリミティブ型かどうかをチェックします。
 *
 * TypeScriptにおけるプリミティブ型は`string`、`number`、`boolean`、`symbol`、`undefined`、`null`です。
 * この関数はタイプガードとして機能し、値がプリミティブ型の場合、その値の型を絞り込みます。
 *
 * @param value - チェックする値。
 * @returns `value`がプリミティブ型であれば`true`、そうでなければ`false`を返します。
 */
export function isPrimitive(
  value: unknown
): value is string | number | boolean | symbol | null | undefined {
  const type = typeof value;
  return value === null || (type !== "object" && type !== "function");
}

/**
 * `defaultValue`オブジェクトに`mergingValue`オブジェクトのプロパティをマージします。
 * `mergingValue`の各プロパティが`undefined`ではない場合のみ、その値で`defaultValue`のプロパティを更新します。
 *
 * @param defaultValue - マージの基準となるオブジェクト。このオブジェクトのプロパティは、`mergingValue`の対応するプロパティが`undefined`でない場合にのみ更新されます。
 * @param mergingValue - `defaultValue`にマージしたいプロパティを持つオブジェクト。このオブジェクトのプロパティは`Partial<T>`型で、オプショナルです。
 * @returns マージ後の新しいオブジェクトを返します。この操作は不変性を保持します。
 *
 * @example
 * ```typescript
 * interface ExampleType {
 *   a: number;
 *   b: string;
 *   c?: boolean;
 * }
 *
 * const defaultValue: ExampleType = { a: 1, b: "text" };
 * const mergingValue: Partial<ExampleType> = { a: undefined, b: "new text", c: true };
 *
 * const merged = objectMergeFunctional(defaultValue, mergingValue);
 * console.log(merged); // 出力: { a: 1, b: "new text", c: true }
 * ```
 */
export function objectMerge<T>(defaultValue: T, mergingValue: Partial<T>): T {
  return objectKeys(mergingValue).reduce((acc, key) => {
    const value = mergingValue[key];
    // mergingValueのプロパティがundefinedでない場合のみ、accにマージ
    if (value !== undefined) {
      return { ...acc, [key]: value };
    }
    return acc;
  }, defaultValue);
}
