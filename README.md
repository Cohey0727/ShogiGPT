# ShogiGPT

![ShogiGPT](/assets/hero.png)

ShogiGPTは、将棋AIの思考プロセス（Reasoning、Thinking）を可視化し、チャット形式で質問できるAIです。
将棋を Web ベースで提供し、AI による指し手の根拠提示まで行うことを目指すプロジェクトです。フロントエンド（React + vanilla-extract）、バックエンド（Hono + GraphQL）、データベース（PostgreSQL + Hasura）、将棋エンジン（FastAPI）を統合したフルスタック構成で開発を進めています。

## 主な特徴
- 将棋AIの思考プロセスを可視化し、チャット形式でインタラクティブに質問できる
- フルスタック TypeScript 開発（フロントエンド・バックエンド共に型安全）
- Bun による高速な開発環境とビルドパイプライン
- Hasura による自動生成 GraphQL API とリアルタイム Subscription
- FastAPI による高性能な将棋エンジン統合
- vanilla-extract によるゼロランタイム CSS-in-TS
- Vite ベースのホットリロード開発体験

![Match Demo](/assets/match.gif)

## 技術スタック
- **ランタイム**: [Bun](https://bun.sh)（bunfig / bun.lock で管理）
- **フロントエンド**: React 19 + TypeScript + vanilla-extract + Vite
- **バックエンド**: Hono (Bun) + GraphQL
- **データベース**: PostgreSQL + Hasura GraphQL Engine
- **将棋エンジン**: FastAPI (Python)
- **開発ツール**: Vite、Bun build、Just (タスクランナー)

## サービスポート一覧

| ポート | サービス | 目的 |
| --- | --- | --- |
| 5173 | Client (Vite) | フロントエンド開発サーバー（React UI） |
| 5432 | PostgreSQL | データベース（対局、局面、チャット履歴） |
| 7776 | Hasura Console | Hasura 管理コンソール |
| 7777 | Hasura GraphQL API | GraphQL API サーバー（データ取得） |
| 8787 | Server (Hono) | GraphQL API サーバー（ビジネスロジック） |
| 8000 | Shogi AI (FastAPI) | 将棋エンジン API（局面解析、指し手生成） |

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
1. Docker と Docker Compose をインストール
   - [Docker Desktop](https://www.docker.com/products/docker-desktop) をインストール（macOS/Windows）
   - Linux の場合は [Docker Engine](https://docs.docker.com/engine/install/) と [Docker Compose](https://docs.docker.com/compose/install/) をインストール
   - **本プロジェクトはPostgreSQLやHasuraなどのサービスをDockerで実行するため、Dockerが必須です**

2. Bun をインストール (例: `curl -fsSL https://bun.sh/install | bash`)

3. Hasura CLI をインストール
   ```bash
   # macOS/Linux
   curl -L https://github.com/hasura/graphql-engine/raw/stable/cli/get.sh | bash

   # または Homebrew
   brew install hasura-cli
   ```

4. 開発用のプロセスマネージャー `mprocs` をインストール
   ```bash
   # macOS
   brew install mprocs

   # または Cargo (Rust)
   cargo install mprocs
   ```
   `just dev` は複数プロセスを `mprocs` で監視しながら起動します。

5. サーバーの環境変数を設定
   ```bash
   cp server/.env.example server/.env
   ```
   `.env`ファイルを編集して`DEEPSEEK_API_KEY`を設定してください（他の環境変数はデフォルト値で動作します）。

6. 依存関係をインストール
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
| `just ngrok` | ngrokトンネルを起動してサービスを外部公開 |
| `just localtunnel` | localtunnelでサービスを外部公開 |

## 外部公開

ローカル開発環境を外部に公開する方法です。Caddyでパスベースのルーティングを行います。

### ngrokで公開する場合

1. ngrokとCaddyをインストール
   ```bash
   brew install ngrok caddy
   ```

2. [ngrokダッシュボード](https://dashboard.ngrok.com/get-started/your-authtoken)でアカウントを作成し、認証トークンを取得

3. `ngrok.yml`の`authtoken`を取得したトークンに更新
   ```yaml
   authtoken: your_token_here
   ```

4. 起動
   ```bash
   just ngrok
   ```

5. ルーティング
   - `https://xxx.ngrok-free.app/v1/graphql*` → Hasura (localhost:7777)
   - `https://xxx.ngrok-free.app/*` → Client (localhost:3030)

### localtunnelで公開する場合

1. Caddyをインストール（ngrokと同様）
   ```bash
   brew install caddy
   ```

2. 起動
   ```bash
   just localtunnel
   ```
   ※ localtunnel自体はnpx経由で実行されるためインストール不要

3. ルーティング（ngrokと同様）
   - `https://xxx.loca.lt/v1/graphql*` → Hasura (localhost:7777)
   - `https://xxx.loca.lt/*` → Client (localhost:3030)

4. 注意: 初回アクセス時にIP確認画面が表示されます
