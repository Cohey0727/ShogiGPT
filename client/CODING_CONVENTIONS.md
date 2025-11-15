# コーディング規約

## 概要

このドキュメントは、shogi-webプロジェクトにおけるコーディング規約を定めるものです。
一貫性のあるコードベースを維持し、チーム開発を円滑にするために、以下の規約に従ってください。

## 技術スタック

- **フレームワーク**: React 19
- **言語**: TypeScript (Strict Mode)
- **ビルドツール**: Vite (Rolldown)
- **スタイリング**: Vanilla Extract
- **ルーティング**: Wouter
- **UIライブラリ**: Radix UI

## プロジェクト構造

```
src/
├── components/        # UIコンポーネント
│   ├── atoms/        # 基本的なUIコンポーネント（ボタン、入力など）
│   ├── organisms/    # 複雑なコンポーネント（複数のatomsの組み合わせ）
│   ├── layouts/      # レイアウトコンポーネント
│   └── pages/        # ページコンポーネント
├── lib/              # ライブラリ設定、ヘルパー
├── services/         # ビジネスロジック、API呼び出し
├── utils/            # 汎用ユーティリティ関数
├── shared/           # サーバーとの共有コード
└── main.tsx          # エントリーポイント
```

## コンポーネント規約

### 1. コンポーネントのファイル構成

**必須**: すべてのコンポーネントは専用のフォルダに配置する

```
components/atoms/Button/
├── Button.tsx          # コンポーネント本体
├── Button.css.ts       # Vanilla Extractスタイル
└── index.ts            # エクスポート用
```

#### 各ファイルの役割

**`ComponentName.tsx`**
- コンポーネントのロジックとJSXを記述
- named exportを使用（default exportは使用しない）

```tsx
// ✅ 良い例
export const Button = () => { ... }

// ❌ 悪い例
export default function Button() { ... }
```

**`ComponentName.css.ts`**
- Vanilla Extractを使用したスタイル定義
- default exportでスタイルをエクスポート

```ts
import { style, styleVariants } from "@vanilla-extract/css";

export default {
  base: style({ ... }),
  variant: styleVariants({ ... }),
  size: styleVariants({ ... }),
};
```

**`index.ts`**
- コンポーネントの再エクスポートのみ
- 他のモジュールから簡潔にインポートできるようにする

```ts
export * from "./Button";
```

### 2. コンポーネント分類

#### Atoms（基本コンポーネント）
- 単一の責務を持つ最小単位のコンポーネント
- 例: Button, Input, Checkbox, Tooltip, Separator

#### Organisms（複合コンポーネント）
- 複数のAtomsを組み合わせた複雑なコンポーネント
- 独立した機能を持つ
- 例: ShogiBoard, Header, Navigation

#### Layouts（レイアウトコンポーネント）
- ページ全体のレイアウトを定義
- 子コンポーネントを配置する構造のみを提供
- 例: RootLayout, DashboardLayout

#### Pages（ページコンポーネント）
- ルーティングに対応する各ページ
- Organisms、Atoms、Layoutsを組み合わせて構成
- 例: HomePage, MatchesPage, SettingsPage

### 3. コンポーネント命名規則

- **コンポーネント名**: PascalCase（例: `Button`, `ShogiBoard`）
- **ファイル名**: コンポーネント名と一致（例: `Button.tsx`, `Button.css.ts`）
- **フォルダ名**: コンポーネント名と一致（例: `Button/`）
- **Props型**: `{ComponentName}Props`（例: `ButtonProps`）

```tsx
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "default", size = "md", ...props }, ref) => {
    // ...
  }
);

Button.displayName = "Button";
```

### 4. Props設計

- **型定義**: interfaceを使用（typeではなく）
- **拡張**: 適切なHTML要素の属性を継承
- **オプショナル**: デフォルト値を持つpropsは `?` を使用
- **ドキュメント**: 複雑なpropsにはJSDocコメントを追加

```tsx
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * ボタンの見た目のバリエーション
   * @default "default"
   */
  variant?: "default" | "outline" | "ghost";

  /**
   * ボタンのサイズ
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
}
```

### 5. forwardRefの使用

DOM要素を扱うコンポーネントには `forwardRef` を使用し、refを受け取れるようにする。

```tsx
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    return <button ref={ref} {...props} />;
  }
);

Button.displayName = "Button";
```

## TypeScript規約

### 1. 型定義

- **strictモード**: 必ず有効にする
- **any**: 使用禁止（どうしても必要な場合はunknownを使用）
- **型推論**: 可能な限り型推論を活用し、明示的な型注釈は必要な場合のみ
- **Import Type**: 型のみをインポートする場合は `import type` を使用

```tsx
// ✅ 良い例
import type { ButtonHTMLAttributes } from "react";
import { forwardRef } from "react";

// ❌ 悪い例
import { ButtonHTMLAttributes, forwardRef } from "react";
```

### 2. 型の配置

- コンポーネント固有の型: コンポーネントファイル内に定義
- 共有される型: `types/` ディレクトリまたは `shared/` に定義

## スタイリング規約

### 1. Vanilla Extract

すべてのスタイルは Vanilla Extract を使用して定義する。

```ts
// ComponentName.css.ts
import { style, styleVariants } from "@vanilla-extract/css";

export default {
  base: style({
    padding: "8px 16px",
    borderRadius: "4px",
    cursor: "pointer",
  }),

  variant: styleVariants({
    default: { backgroundColor: "blue" },
    outline: { border: "1px solid blue" },
    ghost: { backgroundColor: "transparent" },
  }),
};
```

### 2. クラス名の結合

複数のクラス名を結合する場合はテンプレートリテラルを使用。

```tsx
className={`${styles.base} ${styles.variant[variant]} ${className || ""}`}
```

## インポート規約

### 1. インポート順序

以下の順序でインポートを記述し、各グループ間に空行を入れる。

```tsx
// 1. React関連
import { forwardRef, type ButtonHTMLAttributes } from "react";

// 2. 外部ライブラリ
import { someLibrary } from "some-library";

// 3. 内部モジュール（絶対パス）
import { SomeComponent } from "@/components/atoms";

// 4. 相対パス
import styles from "./Button.css";
```

### 2. エクスポート

- **named export**: 優先的に使用
- **default export**: スタイルファイルのみ使用可
- **re-export**: index.tsで他のモジュールから簡潔にインポートできるようにする

```ts
// index.ts
export * from "./Button";
export * from "./Input";
```

## ディレクトリ構造の詳細規約

### services/
- ビジネスロジック、API呼び出し、データ変換などを配置
- 純粋な関数として実装
- コンポーネントからロジックを分離

```ts
// services/possibleMoves.ts
export function calculatePossibleMoves(board: Board, position: Position) {
  // ロジック
}
```

### utils/
- 汎用的なヘルパー関数
- プロジェクト固有ではない、再利用可能な関数

```ts
// utils/formatDate.ts
export function formatDate(date: Date): string {
  // フォーマット処理
}
```

### lib/
- ライブラリの設定やラッパー
- 外部ライブラリの初期化

```ts
// lib/router.tsx
import { Route } from "wouter";
// ルーティング設定
```

## コード品質

### 1. Linting

コミット前に必ずlintを実行する。

```bash
npm run lint
```

### 2. 型チェック

TypeScriptの型エラーはすべて解決してからコミットする。

```bash
tsc --noEmit
```

### 3. 命名規則

- **変数・関数**: camelCase（例: `userName`, `handleClick`）
- **定数**: UPPER_SNAKE_CASE（例: `MAX_COUNT`, `API_URL`）
- **コンポーネント**: PascalCase（例: `Button`, `HomePage`）
- **型・インターフェース**: PascalCase（例: `ButtonProps`, `User`）

### 4. コメント

- 複雑なロジックには説明コメントを追加
- JSDocを使用して関数やコンポーネントの説明を記述
- 自明なコードにはコメント不要

```tsx
/**
 * ユーザーの権限をチェックし、アクセス可否を返す
 * @param user - チェック対象のユーザー
 * @param resource - アクセス対象のリソース
 * @returns アクセス可能な場合true
 */
export function checkPermission(user: User, resource: Resource): boolean {
  // 実装
}
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
- `style`: スタイル修正（コードの動作に影響しない）
- `docs`: ドキュメント
- `test`: テスト
- `chore`: ビルド、設定など

例:
```
feat: 将棋盤コンポーネントに駒の移動機能を追加

- 駒のドラッグ&ドロップを実装
- 移動可能な位置をハイライト表示
```

## パフォーマンス

### 1. Reactのベストプラクティス

- 不要な再レンダリングを避ける
- 必要に応じて `useMemo`, `useCallback` を使用
- リストのレンダリングには適切な `key` を設定

### 2. バンドルサイズ

- 必要なモジュールのみインポート
- 大きなライブラリは遅延ロード（dynamic import）を検討

```tsx
// ✅ 良い例
import { Button } from "@radix-ui/react-dialog";

// ❌ 悪い例
import * as Dialog from "@radix-ui/react-dialog";
```

## まとめ

この規約に従うことで:
- コードの一貫性が保たれる
- チームメンバーがコードを理解しやすくなる
- メンテナンス性が向上する
- バグの混入を防ぎやすくなる

不明点や改善提案がある場合は、チームで議論して規約を更新してください。
