# Shogi-AI統合タスク

## 目標
client → server → shogi-ai APIの統合
- clientから盤面情報を送信
- serverがshogi-ai APIに問い合わせ
- 評価値・候補手を取得して返す

---

## Phase 1: OpenAPIクライアント生成 ✅完了

### 1.1 OpenAPI生成ツールのセットアップ
- [x] serverにopenapi-typescriptまたはorvalをインストール（`@hey-api/openapi-ts`）
- [x] server/package.jsonにcodegen:shogiスクリプトを追加
- [x] 生成先ディレクトリを決定（`server/src/generated/shogi-api/`）
- [x] server/openapi.jsonのシンボリックリンク作成

### 1.2 OpenAPIからTypeScriptクライアントを生成
- [x] openapi.jsonからTypeScript型定義を生成
- [x] APIクライアントコードを生成

### 1.3 生成スクリプトの統合
- [x] `just codegen`から生成スクリプトを呼び出す（親justfileに統合済み）
- [x] 生成されたコードの動作確認

---

## Phase 2: Server側サービス実装 ✅完了

### 2.1 Shogi-AI APIクライアントサービスの作成
- [x] 生成されたクライアントをラップ
- [x] エラーハンドリング実装
- [x] 環境変数SHOGI_AI_URLでベースURL設定可能

### 2.2 基本的なAPI呼び出しメソッド実装
- [x] `analyzePosition()`メソッド
  - sfen/movesを受け取る
  - shogi-ai APIの`/analyze`エンドポイントを呼び出す
  - 評価値と候補手を返す
- [x] `getEngineInfo()`メソッド（エンジン情報取得）
- [x] `checkHealth()`メソッド（ヘルスチェック）

---

## Phase 3: 動作確認・統合テスト ⏸️準備完了

### 3.1 直接呼び出しテスト
- [x] server側でテストスクリプト作成（`server/src/scripts/testShogiApi.ts`）
- [x] 平手初期局面で解析実行（スクリプト内に実装）
- [x] MultiPVで複数候補手取得（スクリプト内に実装）
- [x] レスポンスの検証（スクリプト内に実装）

---

## Phase 4: GraphQL統合 ✅完了

### 4.1 GraphQLスキーマ拡張
- [x] `server/schema.graphql` 更新
- [x] AnalysisInput型定義（camelCase）
- [x] AnalysisResult型定義（MoveVariation含む）
- [x] Query.analyzePosition追加

### 4.2 Resolverの実装
- [x] analyzePositionリゾルバ実装（`src/resolvers/Query/analyzePosition.ts`）
- [x] OpenAPI生成関数を直接呼び出し
- [x] snake_case ↔ camelCase 変換処理

### 4.3 GraphQL動作確認
- [ ] GraphQL Playgroundで手動テスト
- [ ] clientから呼び出し可能か確認

---

## Phase 5: Client統合（最終段階）

### 5.1 GraphQLクエリ・型生成
- [ ] client側のGraphQLクエリ作成
- [ ] `just codegen`で型生成

### 5.2 UI実装
- [ ] 対局詳細画面に「AI解析」ボタン追加
- [ ] 解析結果表示コンポーネント作成
- [ ] 候補手と評価値の表示

### 5.3 E2Eテスト
- [ ] 実際の盤面でAI解析を実行
- [ ] 結果表示の確認

---

## 技術スタック

- **コード生成**: `@hey-api/openapi-ts` or `orval`
- **HTTPクライアント**: `fetch` or `axios`
- **バリデーション**: 生成された型を使用
- **テスト**: `vitest`

---

## 備考

- shogi-ai APIは`http://localhost:8000`で起動していること
- serverは`http://localhost:4000`
- まずはPhase 1-3を完了させてから、GraphQL統合へ進む
