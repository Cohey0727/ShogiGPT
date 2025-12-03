# ShogiGPT ランディングページ

ShogiGPT サービスのランディングページです。[Qwik](https://qwik.dev/) フレームワークで構築されています。

> **注意**: このディレクトリは `justfile` の管理外です。`just dev` や `just build` などのコマンドには含まれません。LP の開発・ビルドは以下のコマンドを直接実行してください。

## 開始方法

```bash
# 依存関係のインストール
bun install

# 開発サーバーの起動
bun run dev
```

開発サーバーは http://localhost:5173 で起動します。

## ビルドと起動

```bash
# 本番用ビルド
bun run build

# ビルド結果のプレビュー
bun run preview
```

プレビューサーバーは http://localhost:4173 で起動します。

> **注意**: `bun run preview` はローカル確認用です。本番環境へのデプロイには別途ホスティングサービス（Cloudflare Pages、Vercel など）への設定が必要です。

## コマンド一覧

| コマンド | 説明 |
| --- | --- |
| `bun run dev` | 開発サーバーを起動（ホットリロード対応） |
| `bun run build` | 本番用ビルドを生成 |
| `bun run preview` | ビルド結果をローカルでプレビュー |
| `bun run lint` | ESLint によるコードチェック |

## ディレクトリ構成

```
lp/
├── public/           # 静的アセット（favicon、3Dモデルなど）
└── src/
    ├── components/   # コンポーネント
    └── routes/       # ページ（ディレクトリベースルーティング）
```

## 技術スタック

- **フレームワーク**: Qwik + QwikCity
- **ビルドツール**: Vite
- **3Dレンダリング**: @google/model-viewer
- **スタイリング**: CSS（グローバルCSS）

## 共有設定

以下のファイルはルートディレクトリからシンボリックリンクで共有しています:

- `.prettierrc` → `../.prettierrc`
- `.prettierignore` → `../.prettierignore`
- `public/assets/3d/` → `../client/public/assets/3d/`
