export type FilteredKeyOf<T, U> = Exclude<
  {
    [P in keyof T]: T[P] extends U ? P : never;
  }[keyof T],
  undefined
>;

export type IndexType = string | number;

/**
 * Union 型を Intersection 型に変換します。
 * type Union = { a: number } | { b: number };
 * type Intersection = UnionToIntersection<Union>;  // { a: 1 } & { b: 2 }
 */
export type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

export type IntersectionToObject<T> = { [K in keyof T]: T[K] };
export type Combine<T> = IntersectionToObject<UnionToIntersection<T>>;

/**
 * 指定した型から、各プロパティへのピリオド区切りのパスをフラット化したオブジェクトを取得します。
 * type Obj = { a: { b: { c: number } } };
 * type Path = PathFlatten<Obj>;  // { 'a.b.c': number }
 */
export type PathFlatten<T, Prefix extends string = ""> = Combine<
  Required<T> extends Array<infer ListItem>
    ? ListItem extends object
      ? PathFlatten<ListItem, `${Prefix}${number}.`>
      : { [P in `${Prefix}${number}`]: ListItem }
    : {
        [K in keyof Required<T>]: Required<T>[K] extends object
          ? PathFlatten<Required<T>[K], `${Prefix}${K & string}.`>
          : { [P in `${Prefix}${K & string}`]: Required<T>[K] };
      }[keyof Required<T>]
>;

// 引数の型がanyかどうかを判定する型
export type IsAny<T> = 0 extends 1 & T ? true : false;

/**
 * 指定した型から、各プロパティへのピリオド区切りのパスをユニオン型を取得します。
 * type Obj = { a: { b: { c: number } } };
 * type Path = PathOf<Obj>;  // 'a' | 'a.b' | 'a.b.c'
 */
export type PathOf<T, Prefix extends string = ""> =
  IsAny<T> extends true
    ? Prefix
    : T extends Array<infer ListItem>
      ? ListItem extends object
        ? PathOf<ListItem, `${Prefix}${number}.`>
        : `${Prefix}${number}`
      : {
          [Key in keyof T]: NonNullable<T[Key]> extends object
            ? `${Prefix}${Key & string}` | `${PathOf<T[Key], `${Prefix}${Key & string}.`>}`
            : `${Prefix}${Key & string}`;
        }[keyof T];

export type Merge<T1, T2> = Omit<T1, keyof T2> & T2;

export type ArrayLength<T extends readonly unknown[]> = T["length"];

export type Enumerate<N extends number, Acc extends number[] = []> = Acc["length"] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc["length"]]>;

export type NumberRange<S extends number, E extends number> = Exclude<Enumerate<E>, Enumerate<S>>;

export type Falsy = false | 0 | "" | null | undefined;

export type LastOf<T> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  UnionToIntersection<T extends any ? () => T : never> extends () => infer R ? R : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Push<T extends any[], V> = [...T, V];

// 配列をタプルに変換する型
export type Tuplify<T, L = LastOf<T>, N = [T] extends [never] ? true : false> = true extends N
  ? []
  : Push<Tuplify<Exclude<T, L>>, L>;

export type EmptyObject = Record<string, never>;

export type SnakeToCamelCase<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<SnakeToCamelCase<U>>}`
  : S;

export type SnakeToCamelCaseNested<T> =
  T extends Array<infer U>
    ? Array<SnakeToCamelCaseNested<U>>
    : T extends object
      ? {
          [K in keyof T as SnakeToCamelCase<K & string>]: SnakeToCamelCaseNested<T[K]>;
        }
      : T;

export type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? T extends Lowercase<T>
    ? `${T}${CamelToSnakeCase<U>}`
    : `_${Lowercase<T>}${CamelToSnakeCase<U>}`
  : S;

export type CamelToSnakeCaseNested<T> =
  T extends Array<infer U>
    ? Array<CamelToSnakeCaseNested<U>>
    : T extends object
      ? {
          [K in keyof T as CamelToSnakeCase<K & string>]: CamelToSnakeCaseNested<T[K]>;
        }
      : T;

export type NonEmptyArray<T> = [T, ...T[]];

export type Exact<T> = {
  [K in keyof T]-?: NonNullable<T[K]>;
};
