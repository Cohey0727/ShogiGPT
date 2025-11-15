# やねうら王+水匠5 Docker+FastAPI実装タスク

このドキュメントは、SHOGI_AI.mdの実装を段階的に検証しながら進めるためのタスクリストです。

## フェーズ1: FastAPI動作確認（最小構成）

### ファイル作成

- [ ] `requirements.txt`を作成
  ```txt
  fastapi==0.115.0
  uvicorn[standard]==0.32.0
  ```

- [ ] `app/hello.py`を作成
  ```python
  from fastapi import FastAPI
  app = FastAPI()

  @app.get("/")
  async def root():
      return {"message": "Hello from FastAPI"}

  @app.get("/health")
  async def health():
      return {"status": "ok"}
  ```

- [ ] `Dockerfile.test`を作成
  ```dockerfile
  FROM ubuntu:24.04
  ENV DEBIAN_FRONTEND=noninteractive
  RUN apt-get update && apt-get install -y \
      python3 \
      python3-pip \
      curl \
      && rm -rf /var/lib/apt/lists/*
  WORKDIR /app
  COPY requirements.txt .
  RUN pip3 install --break-system-packages --no-cache-dir -r requirements.txt
  COPY app/hello.py /app/main.py
  CMD ["python3", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
  ```

### ビルドとテスト

- [ ] イメージをビルド
  ```bash
  docker build -f Dockerfile.test -t fastapi-test .
  ```

- [ ] コンテナを起動
  ```bash
  docker run -d -p 8000:8000 --name fastapi-test fastapi-test
  ```

- [ ] 動作確認
  ```bash
  curl http://localhost:8000/
  curl http://localhost:8000/health
  ```

- [ ] コンテナを停止・削除
  ```bash
  docker stop fastapi-test
  docker rm fastapi-test
  ```

**検証方法**: FastAPIが正常に起動し、両エンドポイントからレスポンスが返ってくる

---

## フェーズ3: YaneuraOu + FastAPI統合

### 完全版ファイルの作成

- [ ] `Dockerfile`を作成（SHOGI_AI.mdの完全版）
- [ ] `app/usi_engine.py`を作成（SHOGI_AI.mdのコード）
- [ ] `app/main.py`を作成（SHOGI_AI.mdのコード）
- [ ] `docker-compose.yml`を作成（SHOGI_AI.mdの設定）

### ビルドと起動

- [ ] Docker Composeでビルド
  ```bash
  docker compose build
  ```
  ※ビルドには時間がかかる（YaneuraOuのコンパイル）

- [ ] コンテナを起動
  ```bash
  docker compose up -d
  ```

- [ ] ログを確認
  ```bash
  docker compose logs -f
  ```
  エンジンプールが初期化されるメッセージを確認

### 基本動作確認

- [ ] ヘルスチェック
  ```bash
  curl http://localhost:8000/health
  ```

- [ ] エンジン情報取得
  ```bash
  curl http://localhost:8000/engine/info | jq
  ```

**検証方法**:
- ビルドがエラーなく完了する
- エンジンプールが正常に初期化される（ログで確認）
- ヘルスチェックが`{"status": "healthy"}`を返す
- エンジン情報が取得できる

**問題が発生した場合**:
- コンテナ内に入ってエンジンファイルを確認
  ```bash
  docker compose exec shogi-api bash
  ls -la /engine/YaneuraOu
  ls -la /engine/eval/nn.bin
  /engine/YaneuraOu  # 手動でエンジン起動テスト（usiと入力）
  ```

---

## フェーズ4: API機能テスト

### 解析エンドポイント

- [ ] 平手初期局面の解析（1秒、1候補手）
  ```bash
  curl -X POST http://localhost:8000/analyze \
    -H "Content-Type: application/json" \
    -d '{"time_ms": 1000, "multipv": 1}' | jq
  ```

- [ ] MultiPV（3候補手）のテスト
  ```bash
  curl -X POST http://localhost:8000/analyze \
    -H "Content-Type: application/json" \
    -d '{"time_ms": 3000, "multipv": 3}' | jq
  ```

- [ ] SFEN局面からの解析
  ```bash
  curl -X POST http://localhost:8000/analyze \
    -H "Content-Type: application/json" \
    -d '{
      "sfen": "lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1",
      "time_ms": 2000,
      "multipv": 1
    }' | jq
  ```

- [ ] 指し手リストからの解析
  ```bash
  curl -X POST http://localhost:8000/analyze \
    -H "Content-Type: application/json" \
    -d '{
      "moves": ["7g7f", "3c3d"],
      "time_ms": 2000,
      "multipv": 1
    }' | jq
  ```

### 詰み探索エンドポイント

- [ ] 詰み局面のテスト
  ```bash
  curl -X POST http://localhost:8000/mate \
    -H "Content-Type: application/json" \
    -d '{
      "sfen": "9/9/9/9/9/9/9/4k4/4K4 b G 1",
      "time_ms": 5000
    }' | jq
  ```

**検証方法**:
- `bestmove`が返ってくる
- `variations`に候補手情報が含まれる
- MultiPVで複数の候補が返る
- 詰み局面では`mate_found: true`と手順が返る

---

## フェーズ5: 追加検証（オプション）

### エラーハンドリング

- [ ] 不正なSFEN文字列
  ```bash
  curl -X POST http://localhost:8000/analyze \
    -H "Content-Type: application/json" \
    -d '{"sfen": "invalid", "time_ms": 1000}' | jq
  ```
  → 適切なエラーレスポンスが返る

- [ ] 範囲外のパラメータ
  ```bash
  curl -X POST http://localhost:8000/analyze \
    -H "Content-Type: application/json" \
    -d '{"time_ms": 999999}' | jq
  ```
  → バリデーションエラーが返る

### パフォーマンス

- [ ] 並列リクエストのテスト（複数のcurlを同時実行）
  ```bash
  for i in {1..5}; do
    curl -X POST http://localhost:8000/analyze \
      -H "Content-Type: application/json" \
      -d '{"time_ms": 1000}' &
  done
  wait
  ```
  → すべてのリクエストが正常に処理される

**検証方法**: エラー時に適切なHTTPステータスとメッセージが返る

---

## トラブルシューティング

### ビルドが失敗する場合

1. **YaneuraOuのビルドエラー**
   - CPU命令セットの問題: Dockerfileの`TARGET_CPU=AVX2`を`SSE42`に変更
   - メモリ不足: Dockerのメモリ設定を増やす

2. **評価関数ファイルのダウンロード失敗**
   - URLが無効な場合: 別のソースから手動でダウンロード
   - コンテナ内で確認: `docker compose exec shogi-api ls -la /engine/eval/`

### APIが起動しない場合

1. **エンジンプール初期化エラー**
   - ログを確認: `docker compose logs shogi-api`
   - エンジンファイルの権限確認: `docker compose exec shogi-api ls -la /engine/`

2. **Pythonパッケージエラー**
   - requirements.txtのバージョンを確認
   - pipのインストールログを確認

### レスポンスが返らない場合

1. **エンジンがハングする**
   - タイムアウト設定を確認
   - エンジンを手動で起動して動作確認

2. **パフォーマンスが悪い**
   - `USI_Hash`を調整（docker-compose.ymlのoptions）
   - `pool_size`を調整
   - `Threads`を調整

---

## チェックリスト

- [x] フェーズ1: Docker環境確認
- [x] フェーズ2: FastAPI動作確認
- [ ] フェーズ3: YaneuraOu統合
- [ ] フェーズ4: API機能テスト
- [ ] フェーズ5: 追加検証（オプション）

---

