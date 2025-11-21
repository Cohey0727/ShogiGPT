# コーディング規約（サーバー）

## 概要

このドキュメントは、shogi-gptプロジェクトのサーバーサイドにおけるコーディング規約を定めるものです。
一貫性のあるコードベースを維持し、チーム開発を円滑にするために、以下の規約に従ってください。

## 技術スタック

- **ランタイム**: Bun
- **フレームワーク**: Hono
- **API**: GraphQL
- **言語**: TypeScript (Strict Mode)
- **スキーマ管理**: GraphQL Code Generator

## プロジェクト構造

```
src/
├── resolvers/        # GraphQLリゾルバー
│   ├── Query/       # クエリリゾルバー
│   ├── Mutation/    # ミューテーションリゾルバー（今後追加）
│   ├── resolvers.ts # リゾルバーの集約
│   ├── schema.ts    # GraphQLスキーマ定義
│   └── types.ts     # リゾルバー型定義
├── services/         # ビジネスロジック、ドメインロジック
├── shared/           # クライアントとの共有コード
│   └── consts/      # 定数定義
├── middleware/       # Honoミドルウェア（今後追加）
└── index.ts          # エントリーポイント
```

## ディレクトリ別規約

### resolvers/

GraphQLリゾルバーを配置するディレクトリ。

#### ファイル構成

各リゾルバータイプごとにディレクトリを作成し、その中に個別のリゾルバーファイルを配置する。

```
resolvers/
├── Query/
│   ├── health.ts     # healthクエリのリゾルバー
│   ├── matches.ts    # matchesクエリのリゾルバー
│   └── index.ts      # 再エクスポート
├── Mutation/
│   ├── startMatch.ts
│   └── index.ts
├── resolvers.ts      # すべてのリゾルバーを集約
├── schema.ts         # GraphQLスキーマ
└── types.ts          # カスタム型定義
```

#### リゾルバーの実装

**必須**: リゾルバーは型安全に実装する。

```ts
// Query/health.ts
import type { QueryResolvers } from "../../generated/graphql/types";

export const health: QueryResolvers["health"] = () => ({
  status: "ok",
  timestamp: new Date().toISOString(),
});
```

**ポイント**:
- GraphQL Code Generatorで生成された型を使用
- `import type` で型のみをインポート
- named exportを使用
- アロー関数で実装

#### index.ts での再エクスポート

```ts
// Query/index.ts
export * from "./health";
export * from "./matches";
```

#### resolvers.ts での集約

```ts
// resolvers.ts
import type { Resolvers } from "../generated/graphql/types";
import * as Query from "./Query";
import * as Mutation from "./Mutation";

export const resolvers: Resolvers = {
  Query,
  Mutation,
};
```

### services/

ビジネスロジック、ドメインロジック、複雑な計算処理などを配置する。

#### 原則

- **純粋関数**: 可能な限り副作用のない純粋関数として実装
- **単一責任**: 1つのファイルに1つの責務
- **テスタブル**: ユニットテストが書きやすい設計

#### ファイル命名規則

- 機能を表す名詞または動詞（例: `moveAnalyzer.ts`, `boardDiff.ts`）
- 複数の関連する関数を含む場合は、主要な機能名を使用

#### 実装例

```ts
// services/moveAnalyzer.ts
import type { Position, Piece, Player } from "../shared/consts/shogi";

/**
 * 指し手情報
 */
export interface Move {
  /** 移動の種類 */
  type: MoveType;
  /** 移動元の位置（駒打ちの場合はundefined） */
  from?: Position;
  /** 移動先の位置 */
  to: Position;
  /** 移動した駒 */
  piece: Piece;
  /** 取った駒（なければundefined） */
  captured?: Piece;
  /** 成ったかどうか */
  promoted: boolean;
}

/**
 * BoardDiffから指し手情報を算出する
 *
 * @param diff - ボードの差分情報
 * @param currentPlayer - 現在の手番のプレイヤー（移動前の手番）
 * @returns 指し手情報、または解析できない場合はnull
 */
export function analyzeMove(
  diff: BoardDiff,
  currentPlayer: Player
): Move | null {
  // 実装
}
```

**ポイント**:
- JSDocで関数とインターフェースを文書化
- パラメータと戻り値を明確に説明
- nullableな戻り値は明示的に型定義

### shared/

クライアントとサーバーで共有するコードを配置する。

#### 配置するもの

- 型定義
- 定数
- 列挙型
- バリデーションロジック（今後）

#### 注意点

- **依存関係**: サーバー固有の依存関係を含めない
- **シンボリックリンク**: クライアント側から参照される（`client/src/shared -> server/src/shared`）
- **純粋なTypeScript**: ランタイム固有のコードを含めない

```ts
// shared/consts/shogi.ts
/**
 * プレイヤー（先手・後手）
 */
export const Player = {
  Sente: "sente",
  Gote: "gote",
} as const;

export type Player = (typeof Player)[keyof typeof Player];

/**
 * 駒の種類
 */
export interface Piece {
  type: PieceType;
  player: Player;
}
```

### middleware/ (今後追加予定)

Honoのミドルウェアを配置する。

#### 例

- 認証・認可
- ロギング
- エラーハンドリング
- CORS設定

```ts
// middleware/auth.ts
import type { MiddlewareHandler } from "hono";

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  // 認証処理
  await next();
};
```

## TypeScript規約

### 1. 型定義

- **strictモード**: 必ず有効にする
- **any**: 使用禁止（どうしても必要な場合はunknownを使用）
- **型推論**: 可能な限り型推論を活用
- **Import Type**: 型のみをインポートする場合は `import type` を使用

```ts
// ✅ 良い例
import type { QueryResolvers } from "../generated/graphql/types";
import { someFunction } from "./utils";

// ❌ 悪い例
import { QueryResolvers, someFunction } from "./module";
```

### 2. 型の配置

- **GraphQL関連**: GraphQL Code Generatorで自動生成（`generated/`）
- **ドメイン型**: `services/` の各ファイル内に定義
- **共有型**: `shared/` に定義
- **リゾルバー型**: `resolvers/types.ts` に定義（必要な場合）

### 3. 定数の型定義

`as const` を使用してリテラル型を定義する。

```ts
// ✅ 良い例
export const MoveType = {
  Move: "move",
  Drop: "drop",
} as const;

export type MoveType = (typeof MoveType)[keyof typeof MoveType];

// ❌ 悪い例
export enum MoveType {
  Move = "move",
  Drop = "drop",
}
```

**理由**: `as const` はより柔軟で、型推論が効きやすい。

## GraphQL規約

### 1. スキーマ定義

`schema.graphql` でスキーマを定義し、GraphQL Code Generatorで型を生成する。

```graphql
# schema.graphql
type Query {
  health: HealthStatus!
  matches: [Match!]!
}

type HealthStatus {
  status: String!
  timestamp: String!
}
```

### 2. コード生成

スキーマを変更したら、必ずコード生成を実行する。

```bash
bun run codegen
```

### 3. リゾルバーの型安全性

自動生成された `QueryResolvers`, `MutationResolvers` などの型を使用する。

```ts
import type { QueryResolvers } from "../generated/graphql/types";

export const health: QueryResolvers["health"] = () => ({
  status: "ok",
  timestamp: new Date().toISOString(),
});
```

## 命名規則

### 1. 変数・関数

- **変数**: camelCase（例: `currentPlayer`, `boardDiff`）
- **関数**: camelCase（例: `analyzeMove`, `calculateDiff`）
- **boolean変数**: `is`, `has`, `should` などの接頭辞（例: `isValid`, `hasPermission`）

### 2. 定数

- **定数オブジェクト**: PascalCase（例: `MoveType`, `Player`）
- **単純な定数**: UPPER_SNAKE_CASE（例: `MAX_RETRIES`, `API_VERSION`）

```ts
// 定数オブジェクト
export const Player = {
  Sente: "sente",
  Gote: "gote",
} as const;

// 単純な定数
export const DEFAULT_PORT = 8787;
```

### 3. 型・インターフェース

- PascalCase（例: `Move`, `BoardDiff`, `QueryResolvers`）

### 4. ファイル・ディレクトリ

- camelCase（例: `moveAnalyzer.ts`, `boardDiff.ts`）
- ディレクトリ: PascalCase（例: `Query/`, `Mutation/`）または小文字（例: `services/`, `shared/`）

## エクスポート規約

### 1. named export

すべてのエクスポートは named export を使用する。

```ts
// ✅ 良い例
export function analyzeMove() { ... }
export const MoveType = { ... };

// ❌ 悪い例
export default function analyzeMove() { ... }
```

### 2. 再エクスポート

index.tsで関連する機能をまとめて再エクスポートする。

```ts
// Query/index.ts
export * from "./health";
export * from "./matches";
```

## インポート規約

### 1. インポート順序

以下の順序でインポートを記述し、各グループ間に空行を入れる。

```ts
// 1. 外部ライブラリ
import { Hono } from "hono";
import { graphqlServer } from "@hono/graphql-server";

// 2. 型インポート（外部）
import type { MiddlewareHandler } from "hono";

// 3. 内部モジュール
import { analyzeMove } from "./services/moveAnalyzer";
import { schema } from "./resolvers/schema";

// 4. 型インポート（内部）
import type { Move } from "./services/moveAnalyzer";

// 5. 相対パス（shared）
import { Player } from "../shared/consts/shogi";
```

## ドキュメンテーション

### 1. JSDocの使用

すべての公開関数とインターフェースにJSDocを記述する。

```ts
/**
 * BoardDiffから指し手情報を算出する
 *
 * @param diff - ボードの差分情報
 * @param currentPlayer - 現在の手番のプレイヤー（移動前の手番）
 * @returns 指し手情報、または解析できない場合はnull
 */
export function analyzeMove(
  diff: BoardDiff,
  currentPlayer: Player
): Move | null {
  // 実装
}
```

### 2. インターフェースのドキュメント

```ts
/**
 * 指し手情報
 */
export interface Move {
  /** 移動の種類 */
  type: MoveType;
  /** 移動元の位置（駒打ちの場合はundefined） */
  from?: Position;
  /** 移動先の位置 */
  to: Position;
}
```

### 3. 複雑なロジックのコメント

複雑なアルゴリズムや非自明な処理にはインラインコメントを追加する。

```ts
// 成った場合、成り駒が正しいか確認
if (promoted) {
  const expectedPromoted = pieceProperties[movedPiece.type].promoted;
  if (expectedPromoted !== destinationPiece.type) {
    return null;
  }
}
```

## エラーハンドリング

### 1. 明示的なnullチェック

失敗する可能性がある処理は、nullまたはundefinedを返す。

```ts
export function analyzeMove(
  diff: BoardDiff,
  currentPlayer: Player
): Move | null {
  if (cellDiffs.length === 0 || cellDiffs.length > 2) {
    return null;  // 明示的に失敗を返す
  }
  // ...
}
```

### 2. GraphQLエラー

GraphQLのエラーハンドリングは適切に行う。

```ts
import { GraphQLError } from "graphql";

export const startMatch: MutationResolvers["startMatch"] = (_, args) => {
  if (!isValidInput(args)) {
    throw new GraphQLError("Invalid input", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }
  // ...
};
```

## Hono規約

### 1. ルート定義

ルートは機能ごとにグループ化する。

```ts
const app = new Hono();

// ヘルスチェック系
app.get("/", (c) => c.json({ message: "API is running" }));
app.get("/healthz", (c) => c.json({ status: "ok" }));

// GraphQL
app.use("/graphql", graphqlServer({ schema }));
```

### 2. レスポンス形式

一貫したレスポンス形式を使用する。

```ts
// ✅ 良い例
app.get("/healthz", (c) =>
  c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  })
);

// 必要に応じてステータスコードを明示
app.post("/matches", (c) =>
  c.json({ id: "123", created: true }, 201)
);
```

### 3. 環境変数

環境変数は `Bun.env` から取得し、デフォルト値を設定する。

```ts
const port = Number.parseInt(Bun.env.PORT ?? "8787", 10);
const isDev = Bun.env.NODE_ENV !== "production";
```

## コード品質

### 1. Linting

コミット前に必ずlintを実行する。

```bash
bun run lint
```

### 2. 型チェック

TypeScriptの型エラーはすべて解決してからコミットする。

```bash
bun run build
# または
tsc --noEmit
```

### 3. GraphQLスキーマ検証

スキーマを変更したら、コード生成を実行し、型エラーがないことを確認する。

```bash
bun run codegen
bun run lint
```

## パフォーマンス

### 1. 非同期処理

- I/O処理は必ず非同期で実装
- 並列処理が可能な場合は `Promise.all` を使用

```ts
// ✅ 良い例
const [user, matches] = await Promise.all([
  fetchUser(userId),
  fetchMatches(userId),
]);

// ❌ 悪い例（直列実行）
const user = await fetchUser(userId);
const matches = await fetchMatches(userId);
```

### 2. メモリ効率

大きなデータを扱う場合は、ストリーミングやページネーションを検討する。

## テスト（今後追加予定）

### 1. ユニットテスト

- すべてのservices関数にユニットテストを書く
- テストファイルは `*.test.ts` という命名規則

```ts
// services/moveAnalyzer.test.ts
import { describe, test, expect } from "bun:test";
import { analyzeMove } from "./moveAnalyzer";

describe("analyzeMove", () => {
  test("should analyze a normal move", () => {
    // テスト
  });
});
```

## Git規約

### 1. コミットメッセージ

```
<type>: <subject>

<body>
```

**type**:
- `feat`: 新機能
- `fix`: バグ修正
- `refactor`: リファクタリング
- `perf`: パフォーマンス改善
- `docs`: ドキュメント
- `test`: テスト
- `chore`: ビルド、設定など

例:
```
feat: 指し手解析機能を追加

- BoardDiffから指し手情報を算出する関数を実装
- 駒打ちと通常の移動に対応
- 成りの判定ロジックを追加
```

## セキュリティ

### 1. 入力検証

すべての外部入力（GraphQLの引数など）を検証する。

```ts
export const startMatch: MutationResolvers["startMatch"] = (_, args) => {
  // 入力検証
  if (!args.player1 || !args.player2) {
    throw new GraphQLError("Player names are required");
  }
  // ...
};
```

### 2. 環境変数

機密情報は環境変数で管理し、コードにハードコードしない。

```ts
// ❌ 悪い例
const apiKey = "sk-1234567890";

// ✅ 良い例
const apiKey = Bun.env.API_KEY;
if (!apiKey) {
  throw new Error("API_KEY is not set");
}
```

## まとめ

この規約に従うことで:
- コードの一貫性が保たれる
- 型安全性が向上する
- チームメンバーがコードを理解しやすくなる
- メンテナンス性が向上する
- バグの混入を防ぎやすくなる

不明点や改善提案がある場合は、チームで議論して規約を更新してください。
