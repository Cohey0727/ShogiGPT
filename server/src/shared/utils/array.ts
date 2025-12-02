import { FilteredKeyOf, IndexType } from "./types";

/**
 * 指定されたキーまたはキー生成関数に基づいて、配列の要素をグループ化します。
 *
 * @template T - 入力配列の要素の型。
 * @template K - 配列がグループ化されるキーの型。
 * @param array - グループ化する配列。
 * @param key - キー（Tのプロパティ名）または配列内の各要素に対してキーを生成する関数。
 * @returns 指定されたキー（またはキー生成関数によって生成された）の値がキーで、そのキーを持つ要素の配列が値であるオブジェクト。
 */
type GroupByKey<T, K extends IndexType> = FilteredKeyOf<T, K> | ((item: T) => K);

export function groupBy<T, K extends IndexType>(
  array: T[],
  key: GroupByKey<T, K>,
): { [key in K]?: T[] } {
  return array.reduce(
    (result, item) => {
      const groupKey = typeof key === "function" ? key(item) : (item[key as keyof T] as K);
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey]!.push(item);
      return result;
    },
    {} as { [key in K]?: T[] },
  );
}

/**
 * 配列内の重複する要素を指定されたキーに基づいて削除します。
 * 先に出現した要素が優先され、以降の重複要素は除去されます。
 *
 * @template T - 入力配列の要素の型。
 * @template K - 重複排除に使用されるキーの型。
 * @param array - 重複を削除する配列。
 * @param key - キー（Tのプロパティ名）または配列内の各要素に対してキーを生成する関数。
 * @returns 指定されたキーに基づいて重複が削除された新しい配列。
 */
export function uniqBy<T, K extends IndexType>(array: T[], key: GroupByKey<T, K>): T[] {
  const seen = new Set<K>();
  return array.filter((item) => {
    const groupKey = typeof key === "function" ? key(item) : (item[key as keyof T] as K);
    if (seen.has(groupKey)) {
      return false;
    } else {
      seen.add(groupKey);
      return true;
    }
  });
}

/**
 * 配列から比較値が最大の要素を最大n個取得します。
 * 比較値が大きい順にソートされた結果を返します。
 *
 * @template T - 入力配列の要素の型。
 * @param array - 要素を取得する配列。
 * @param n - 取得する最大要素数。
 * @param key - キー（Tのプロパティ名）または配列内の各要素に対してキーを生成する関数。
 * @returns 比較値が大きい順にソートされた最大n個の要素を含む新しい配列。
 */
type TakeMaxByKey<T> = FilteredKeyOf<T, number> | ((item: T) => number);

export function takeMaxBy<T>(array: T[], n: number, key: TakeMaxByKey<T>): T[] {
  if (n <= 0 || array.length === 0) {
    return [];
  }
  const getValue = (item: T): number =>
    typeof key === "function" ? key(item) : (item[key as keyof T] as number);
  return [...array].sort((a, b) => getValue(b) - getValue(a)).slice(0, n);
}
