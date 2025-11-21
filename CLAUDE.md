# ShogiGPT プロジェクト - Claude コンテキスト

## プロジェクト概要

ShogiGPTは、将棋AIの思考プロセス（Reasoning、Thinking）を可視化し、チャット形式で質問できるAIです。
将棋をWebベースで提供し、AIによる指し手の根拠提示まで行うことを目指すプロジェクトです。

## 技術スタック

- **ランタイム**: Bun
- **フロントエンド**: React 19 + TypeScript + vanilla-extract + Vite
- **バックエンド**: Hono (Bun) + GraphQL
- **データベース**: PostgreSQL + Hasura GraphQL Engine
- **将棋エンジン**: FastAPI (Python)

## ディレクトリ構成

```
shogi-gpt/
├── client/         # Webクライアント (Bun + React + vanilla-extract + Vite)
├── server/         # GraphQL APIサーバー (Hono + Bun)
├── hasura/         # Hasura設定とメタデータ
├── shogi-ai/       # 将棋エンジンAPI (FastAPI + Python)
├── justfile        # タスクランナー設定
└── docker-compose.yml  # Docker構成
```

## サービスポート

| ポート | サービス | 目的 |
| --- | --- | --- |
| 5173 | Client (Vite) | フロントエンド開発サーバー |
| 8787 | Server (Hono) | カスタム GraphQL API サーバー |
| 8000 | Shogi API (FastAPI) | 将棋エンジン API |
| 7777 | Hasura GraphQL API | データベース自動生成 GraphQL API + Subscription |
| 7776 | Hasura Console | Hasura 管理コンソール |
| 5432 | PostgreSQL | データベース |

## 重要なルール

### コーディング規約の参照

コードを書く際は、必ず以下のコーディング規約を参照すること：

1. **クライアント側のコード**: `client/CODING_CONVENTIONS.md` を参照
2. **サーバー側のコード**: `server/CODING_CONVENTIONS.md` を参照

これらのファイルには、プロジェクト固有の命名規則、ファイル構成、TypeScript規約、スタイリング規約などが詳細に記載されています。

### 禁止事項

- `any` 型の使用（どうしても必要な場合は `unknown` を使用）
- `default export` の使用（スタイルファイル以外）
- 規約に従わないファイル配置やディレクトリ構成
- コミット前の lint/型チェックの省略
- GraphQL スキーマ変更後のコード生成の省略

### 必須事項

- TypeScript Strict Mode を有効にする
- `import type` を使用して型のみをインポート
- すべての公開関数とインターフェースに JSDoc を記述
- コンポーネントは専用フォルダに配置（`ComponentName/` 内に `ComponentName.tsx`, `ComponentName.css.ts`, `index.ts`）
- named export を使用
- **開発完了後は必ず `just lint` を実行してコード品質を確認すること**

## 開発コマンド

- `just lint`: リント実行（開発完了後に必ず実行）
- `just codegen`: GraphQL型定義生成
