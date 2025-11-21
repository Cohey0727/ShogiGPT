# ShogiGPT

ShogiGPTは、将棋AIの思考プロセス（Reasoning、Thinking）を可視化し、チャット形式で質問できるAIです。
将棋を Web ベースで提供し、AI による指し手の根拠提示まで行うことを目指すプロジェクトです。現時点ではフロントエンド (Bun + React + vanilla-extract + Vite) の雛形を整備しており、今後 AI 推論サービスやバックエンド API と接続していきます。

このリポジトリはモノレポ構成で、今は `client/` パッケージのみ存在します。将来的にサーバー・AI ワーカーなどのパッケージを追加してもルート管理下で共存できます。

## 主な特徴
- 将棋AIの思考プロセスを可視化し、チャット形式でインタラクティブに質問できる
- Bun 1.2 以降で動作する高速な開発環境
- React 19 + vanilla-extract による型安全なスタイリング
- Vite ベースのホットリロード開発体験
- Bun 標準コマンドで統一されたシンプルなビルド/サーブパイプライン

## 技術スタック
- ランタイム: [Bun](https://bun.sh)（bunfig / bun.lock で管理）
- フレームワーク: React 19、TypeScript
- スタイリング: vanilla-extract（ゼロランタイム CSS-in-TS）
- バンドラ/開発ツール: Vite（Rolldown Vite） + Bun build / bunx serve

## サービスポート一覧

| ポート | サービス | 目的 |
| --- | --- | --- |
| 5173 | Client (Vite) | フロントエンド開発サーバー（React UI） |
| 8787 | Server (Hono) | カスタム GraphQL API サーバー（ビジネスロジック） |
| 8000 | Shogi API (FastAPI) | 将棋エンジン API（局面解析、指し手生成） |
| 7777 | Hasura GraphQL API | データベース自動生成 GraphQL API + Subscription |
| 7776 | Hasura Console | Hasura 管理コンソール） |
| 5432 | PostgreSQL | データベース（対局、局面、チャット履歴） |


## ディレクトリ構成
```
shogi-gpt/
├─ client/      # Web クライアント (Bun + React + vanilla-extract + Vite)
├─ server/      # GraphQL API サーバー (Hono + Bun)
├─ hasura/      # Hasura 設定とメタデータ
├─ shogi-ai/    # 将棋エンジン API (FastAPI + Python)
├─ justfile     # タスクランナー設定
└─ docker-compose.yml  # Docker 構成
```

## セットアップ
1. Bun をインストール (例: `curl -fsSL https://bun.sh/install | bash`)
2. 開発用のプロセスマネージャー `mprocs` をインストール（`brew install mprocs` や `cargo install mprocs` など）
3. Hasura CLI をインストール
   ```bash
   # macOS/Linux
   curl -L https://github.com/hasura/graphql-engine/raw/stable/cli/get.sh | bash

   # または Homebrew
   brew install hasura-cli
   ```
4. 依存関係をインストール
   ```bash
   just install
   ```

## 開発・ビルド
| コマンド | 用途 |
| --- | --- |
| `just install` | 依存関係をインストール |
| `just dev` | ホットリロード付き開発サーバー (server: `http://localhost:8787`, client: `http://localhost:5173`, hasura console: `http://localhost:7776`, hasura API: `http://localhost:7777`) |
| `just build` | クライアントとサーバーをビルド |
| `just start` | ビルド済みのクライアントとサーバーを起動（本番検証用） |
| `just lint` | クライアントとサーバーのコードをリント |
| `just codegen` | GraphQLスキーマから型定義を生成 |
| `just db-reset` | データベースを完全にリセット（**警告**: すべてのデータを削除） |

`just dev` は複数プロセスを [`mprocs`](https://github.com/pvolok/mprocs) で監視しながら起動します。まだ `mprocs` が無い場合は `brew install mprocs` もしくは `cargo install mprocs` で導入してください。インストールされていない場合は自動的に従来のバックグラウンド起動方式へフォールバックします。
