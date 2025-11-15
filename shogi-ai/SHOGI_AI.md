# やねうら王+水匠5 Docker+FastAPI完全実装ガイド（Ubuntu 24.04版）

YaneuraOu（やねうら王）と水匠5をUbuntu 24.04ベースのDockerコンテナで動かし、FastAPIでREST APIとして公開するローカル開発環境の実装です。

## 実装の全体アーキテクチャ

本実装は**マルチステージDockerビルド**を採用し、ビルド環境と実行環境を分離して最適化しています。Ubuntu 24.04のデフォルトPython 3.14を使用し、FastAPIは非同期処理でUSIエンジンと通信して複数リクエストを効率的に処理します。

## 1. 完全なDockerfile

```dockerfile
# ========================================
# Stage 1: YaneuraOu Build Stage
# ========================================
FROM ubuntu:24.04 AS builder

# 非対話モードに設定
ENV DEBIAN_FRONTEND=noninteractive

# ビルドに必要な依存関係をインストール
RUN apt-get update && apt-get install -y \
    build-essential \
    g++ \
    clang \
    git \
    wget \
    unzip \
    libopenblas-dev \
    libomp-dev \
    && rm -rf /var/lib/apt/lists/*

# YaneuraOuをクローンしてビルド
WORKDIR /build
RUN git clone https://github.com/yaneurao/YaneuraOu.git

WORKDIR /build/YaneuraOu/source

# AVX2でトーナメントビルドを実行（最も一般的な現代のCPU向け）
# 他のオプション: SSE42（古いCPU）、AVX512（最新Intel）、ZEN2/ZEN3（AMD Ryzen）
RUN make clean && \
    make -j$(nproc) tournament COMPILER=g++ TARGET_CPU=AVX2 YANEURAOU_EDITION=YANEURAOU_ENGINE_NNUE

# 水匠5の評価関数ファイルをダウンロード
WORKDIR /build/eval
RUN wget -O suisho5.zip "https://github.com/yaneurao/YaneuraOu/releases/download/v7.6.3/Suisho5-YaneuraOu-v7.6.3-linux.zip" && \
    unzip suisho5.zip && \
    find . -name "nn.bin" -exec cp {} /build/eval/nn.bin \; || \
    echo "Warning: nn.bin not found in release, downloading separately..." && \
    wget -O nn.zip "https://github.com/mizar/YaneuraOu/releases/download/WCSC32/eval.zip" && \
    unzip -o nn.zip && \
    find . -name "nn.bin" -exec cp {} /build/eval/nn.bin \;

# ========================================
# Stage 2: 実行環境（Ubuntu 24.04 + Python 3.14）
# ========================================
FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

# ランタイムライブラリとPython 3.14（Ubuntu 24.04デフォルト）をインストール
RUN apt-get update && apt-get install -y \
    libgomp1 \
    libopenblas0 \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 非rootユーザーを作成
RUN useradd -m -u 1000 shogi && \
    mkdir -p /app /engine /engine/eval && \
    chown -R shogi:shogi /app /engine

# YaneuraOuバイナリと評価関数をコピー
COPY --from=builder --chown=shogi:shogi /build/YaneuraOu/source/YaneuraOu-by-gcc /engine/YaneuraOu
COPY --from=builder --chown=shogi:shogi /build/eval/nn.bin /engine/eval/nn.bin

# エンジン名ファイルを作成
RUN echo "Suisho5" > /engine/engine_name.txt && \
    chown shogi:shogi /engine/engine_name.txt

# 非rootユーザーに切り替え
USER shogi

# エンジンに実行権限を付与
RUN chmod +x /engine/YaneuraOu

# Python依存関係をインストール
WORKDIR /app
COPY --chown=shogi:shogi requirements.txt .
RUN pip3 install --break-system-packages --no-cache-dir -r requirements.txt

# アプリケーションコードをコピー
COPY --chown=shogi:shogi app/ /app/

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Uvicornでサーバーを起動
CMD ["python3", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 2. FastAPI実装（main.py）

```python
"""
YaneuraOu + Suisho5 REST API
USIプロトコルを使用した将棋エンジンAPI
"""

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
import asyncio
import logging
from contextlib import asynccontextmanager

from usi_engine import USIEnginePool

# ロギング設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# グローバルエンジンプール
engine_pool: Optional[USIEnginePool] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """アプリケーションのライフサイクル管理"""
    global engine_pool
    
    # 起動時: エンジンプールを初期化
    logger.info("Initializing YaneuraOu engine pool...")
    engine_pool = USIEnginePool(
        engine_path="/engine/YaneuraOu",
        pool_size=4,  # 並列リクエスト数
        options={
            "USI_Hash": "256",  # 256MB
            "USI_Ponder": "false",
            "Threads": "2"
        }
    )
    await engine_pool.initialize()
    logger.info("Engine pool ready!")
    
    yield
    
    # 終了時: エンジンプールをクリーンアップ
    logger.info("Shutting down engine pool...")
    await engine_pool.shutdown()
    logger.info("Shutdown complete")

# FastAPIアプリケーション
app = FastAPI(
    title="YaneuraOu + Suisho5 Shogi API",
    description="将棋エンジンやねうら王（水匠5評価関数）のREST API",
    version="1.0.0",
    lifespan=lifespan
)

# ========================================
# リクエスト/レスポンスモデル
# ========================================

class AnalysisRequest(BaseModel):
    """局面解析リクエスト"""
    sfen: Optional[str] = Field(None, description="SFEN形式の局面文字列")
    moves: Optional[List[str]] = Field(None, description="初期局面からの指し手リスト（USI形式）")
    time_ms: int = Field(1000, description="思考時間（ミリ秒）", ge=100, le=60000)
    depth: Optional[int] = Field(None, description="探索深さ（指定時はtime_msを無視）", ge=1, le=30)
    multipv: int = Field(1, description="候補手の数（MultiPV）", ge=1, le=10)
    
    model_config = {
        "json_schema_extra": {
            "examples": [{
                "sfen": "lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1",
                "time_ms": 3000,
                "multipv": 3
            }]
        }
    }

class MoveInfo(BaseModel):
    """1つの候補手情報"""
    move: str = Field(..., description="指し手（USI形式）")
    score_cp: Optional[int] = Field(None, description="評価値（センチポーン）")
    score_mate: Optional[int] = Field(None, description="詰みまでの手数（プライ数）")
    depth: int = Field(..., description="探索深さ")
    nodes: Optional[int] = Field(None, description="探索ノード数")
    pv: Optional[List[str]] = Field(None, description="読み筋（PV）")

class AnalysisResponse(BaseModel):
    """局面解析レスポンス"""
    bestmove: str = Field(..., description="最善手（USI形式）")
    variations: List[MoveInfo] = Field(..., description="候補手リスト（MultiPV）")
    time_ms: int = Field(..., description="実際の思考時間")
    engine_name: str = Field(..., description="エンジン名")

class MateSearchRequest(BaseModel):
    """詰み探索リクエスト"""
    sfen: Optional[str] = Field(None, description="SFEN形式の局面文字列")
    moves: Optional[List[str]] = Field(None, description="初期局面からの指し手リスト")
    time_ms: int = Field(5000, description="詰み探索時間（ミリ秒）", ge=1000, le=30000)

class MateSearchResponse(BaseModel):
    """詰み探索レスポンス"""
    mate_found: bool = Field(..., description="詰みが見つかったか")
    mate_moves: Optional[List[str]] = Field(None, description="詰み手順（USI形式）")
    mate_length: Optional[int] = Field(None, description="詰みまでの手数")
    message: Optional[str] = Field(None, description="メッセージ")

class EngineInfoResponse(BaseModel):
    """エンジン情報レスポンス"""
    name: str
    author: str
    version: str
    options: Dict[str, str]

# ========================================
# エンドポイント
# ========================================

@app.get("/", tags=["Root"])
async def root():
    """APIルート"""
    return {
        "message": "YaneuraOu + Suisho5 Shogi Engine API",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """ヘルスチェックエンドポイント"""
    if engine_pool and engine_pool.is_healthy():
        return JSONResponse(
            status_code=200,
            content={"status": "healthy", "engine": "ready"}
        )
    else:
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "engine": "not ready"}
        )

@app.get("/engine/info", response_model=EngineInfoResponse, tags=["Engine"])
async def get_engine_info():
    """エンジン情報を取得"""
    if not engine_pool:
        raise HTTPException(status_code=503, detail="Engine pool not initialized")
    
    info = engine_pool.get_engine_info()
    return EngineInfoResponse(**info)

@app.post("/analyze", response_model=AnalysisResponse, tags=["Analysis"])
async def analyze_position(request: AnalysisRequest):
    """
    局面を解析して最善手と候補手を返す
    
    - **sfen**: SFEN形式の局面（省略時は平手初期局面）
    - **moves**: 初期局面からの指し手リスト
    - **time_ms**: 思考時間（ミリ秒）
    - **depth**: 探索深さ（指定時は固定深さ探索）
    - **multipv**: 候補手の数（1-10）
    """
    if not engine_pool:
        raise HTTPException(status_code=503, detail="Engine pool not initialized")
    
    try:
        result = await engine_pool.analyze(
            sfen=request.sfen,
            moves=request.moves,
            time_ms=request.time_ms,
            depth=request.depth,
            multipv=request.multipv
        )
        
        return AnalysisResponse(**result)
        
    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/mate", response_model=MateSearchResponse, tags=["Analysis"])
async def search_mate(request: MateSearchRequest):
    """
    詰み探索を実行
    
    - **sfen**: SFEN形式の局面
    - **moves**: 初期局面からの指し手リスト
    - **time_ms**: 詰み探索時間（ミリ秒）
    """
    if not engine_pool:
        raise HTTPException(status_code=503, detail="Engine pool not initialized")
    
    try:
        result = await engine_pool.search_mate(
            sfen=request.sfen,
            moves=request.moves,
            time_ms=request.time_ms
        )
        
        return MateSearchResponse(**result)
        
    except Exception as e:
        logger.error(f"Mate search error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Mate search failed: {str(e)}")

# ========================================
# ログフィルタ（ヘルスチェックを除外）
# ========================================
class EndpointFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        return record.args and len(record.args) >= 3 and record.args[2] != "/health"

logging.getLogger("uvicorn.access").addFilter(EndpointFilter())
```

## 3. USIエンジンラッパークラス（usi_engine.py）

```python
"""
USIエンジンラッパークラス
やねうら王との通信を管理
"""

import asyncio
import time
import logging
from typing import Optional, List, Dict
from asyncio import Queue

logger = logging.getLogger(__name__)

class USIEngine:
    """単一のUSIエンジンインスタンス（非同期対応）"""
    
    def __init__(self, engine_path: str):
        self.engine_path = engine_path
        self.process: Optional[asyncio.subprocess.Process] = None
        self.output_queue: Queue = Queue()
        self._reader_task: Optional[asyncio.Task] = None
        self._running = False
        self.engine_info: Dict[str, str] = {}
        
    async def start(self):
        """エンジンプロセスを起動"""
        self.process = await asyncio.create_subprocess_exec(
            self.engine_path,
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd="/engine"  # 評価関数ファイルのあるディレクトリで起動
        )
        self._running = True
        self._reader_task = asyncio.create_task(self._read_output())
        logger.info(f"Engine started: {self.engine_path}")
        
    async def _read_output(self):
        """エンジンの出力を非同期で読み込む"""
        while self._running and self.process and self.process.stdout:
            try:
                line = await self.process.stdout.readline()
                if not line:
                    break
                decoded = line.decode('utf-8', errors='ignore').strip()
                if decoded:
                    await self.output_queue.put(decoded)
            except Exception as e:
                logger.error(f"Error reading engine output: {e}")
                break
                
    async def send_command(self, command: str):
        """エンジンにコマンドを送信"""
        if self.process and self.process.stdin:
            self.process.stdin.write(f"{command}\n".encode('utf-8'))
            await self.process.stdin.drain()
            logger.debug(f"Sent: {command}")
            
    async def wait_for_response(self, expected: str, timeout: float = 5.0) -> bool:
        """特定のレスポンスを待機"""
        start_time = time.time()
        temp_buffer = []
        
        while time.time() - start_time < timeout:
            try:
                line = await asyncio.wait_for(self.output_queue.get(), timeout=0.5)
                logger.debug(f"Received: {line}")
                
                if line == expected:
                    # 一時バッファをキューに戻す
                    for buffered_line in temp_buffer:
                        await self.output_queue.put(buffered_line)
                    return True
                    
                temp_buffer.append(line)
                
            except asyncio.TimeoutError:
                continue
                
        # タイムアウト時にバッファを戻す
        for buffered_line in temp_buffer:
            await self.output_queue.put(buffered_line)
        return False
        
    async def initialize(self) -> Dict[str, str]:
        """エンジンを初期化してusi, isreadyを送信"""
        await self.send_command("usi")
        
        start_time = time.time()
        while time.time() - start_time < 10.0:
            try:
                line = await asyncio.wait_for(self.output_queue.get(), timeout=0.5)
                logger.debug(f"Init: {line}")
                
                if line.startswith("id name"):
                    self.engine_info["name"] = line[8:].strip()
                elif line.startswith("id author"):
                    self.engine_info["author"] = line[10:].strip()
                elif line == "usiok":
                    logger.info(f"Engine initialized: {self.engine_info.get('name', 'Unknown')}")
                    break
                    
            except asyncio.TimeoutError:
                continue
                
        # isreadyで準備完了を待つ
        await self.send_command("isready")
        await self.wait_for_response("readyok", timeout=10.0)
        
        return self.engine_info
        
    async def set_option(self, name: str, value: str):
        """エンジンオプションを設定"""
        await self.send_command(f"setoption name {name} value {value}")
        await asyncio.sleep(0.05)  # オプション設定の反映待ち
        
    async def set_position(self, sfen: Optional[str] = None, moves: Optional[List[str]] = None):
        """局面を設定"""
        if sfen:
            cmd = f"position sfen {sfen}"
        else:
            cmd = "position startpos"
            
        if moves:
            cmd += " moves " + " ".join(moves)
            
        await self.send_command(cmd)
        
    async def go_analyze(self, time_ms: Optional[int] = None, depth: Optional[int] = None, 
                        multipv: int = 1) -> Dict:
        """解析を実行してbestmoveと情報を取得"""
        
        # MultiPV設定
        if multipv > 1:
            await self.set_option("MultiPV", str(multipv))
        
        # goコマンド構築
        cmd = "go"
        if depth:
            cmd += f" depth {depth}"
        elif time_ms:
            cmd += f" byoyomi {time_ms}"
        else:
            cmd += " byoyomi 1000"
            
        await self.send_command(cmd)
        
        # info行を収集
        variations = {}  # {multipv_num: {...}}
        bestmove = None
        start_time = time.time()
        
        while True:
            try:
                line = await asyncio.wait_for(
                    self.output_queue.get(), 
                    timeout=max(30.0, (time_ms or 1000) / 1000 + 5.0)
                )
                logger.debug(f"Go: {line}")
                
                if line.startswith("info"):
                    info = self._parse_info_line(line)
                    if info and "multipv" in info:
                        pv_num = info["multipv"]
                        variations[pv_num] = info
                        
                elif line.startswith("bestmove"):
                    parts = line.split()
                    if len(parts) >= 2:
                        bestmove = parts[1]
                    break
                    
            except asyncio.TimeoutError:
                logger.warning("Go command timeout")
                break
                
        elapsed_ms = int((time.time() - start_time) * 1000)
        
        return {
            "bestmove": bestmove or "resign",
            "variations": [variations[i] for i in sorted(variations.keys())],
            "time_ms": elapsed_ms
        }
        
    async def go_mate(self, time_ms: int) -> Dict:
        """詰み探索を実行"""
        await self.send_command(f"go mate {time_ms}")
        
        start_time = time.time()
        
        while True:
            try:
                line = await asyncio.wait_for(
                    self.output_queue.get(),
                    timeout=(time_ms / 1000 + 5.0)
                )
                logger.debug(f"Mate: {line}")
                
                if line.startswith("checkmate"):
                    parts = line.split()
                    
                    if len(parts) == 1 or parts[1] == "nomate":
                        return {
                            "mate_found": False,
                            "message": "No mate found"
                        }
                    elif parts[1] == "timeout":
                        return {
                            "mate_found": False,
                            "message": "Search timeout"
                        }
                    elif parts[1] == "notimplemented":
                        return {
                            "mate_found": False,
                            "message": "Mate search not implemented"
                        }
                    else:
                        # 詰み手順
                        mate_moves = parts[1:]
                        return {
                            "mate_found": True,
                            "mate_moves": mate_moves,
                            "mate_length": len(mate_moves)
                        }
                        
            except asyncio.TimeoutError:
                return {
                    "mate_found": False,
                    "message": "Mate search timeout"
                }
                
    def _parse_info_line(self, line: str) -> Optional[Dict]:
        """info行をパース"""
        parts = line.split()
        if len(parts) < 2 or parts[0] != "info":
            return None
            
        info = {}
        i = 1
        
        while i < len(parts):
            if parts[i] == "depth" and i + 1 < len(parts):
                info["depth"] = int(parts[i + 1])
                i += 2
            elif parts[i] == "score" and i + 2 < len(parts):
                score_type = parts[i + 1]
                score_value = int(parts[i + 2])
                if score_type == "cp":
                    info["score_cp"] = score_value
                elif score_type == "mate":
                    info["score_mate"] = score_value
                i += 3
            elif parts[i] == "nodes" and i + 1 < len(parts):
                info["nodes"] = int(parts[i + 1])
                i += 2
            elif parts[i] == "multipv" and i + 1 < len(parts):
                info["multipv"] = int(parts[i + 1])
                i += 2
            elif parts[i] == "pv":
                info["pv"] = parts[i + 1:]
                break
            else:
                i += 1
                
        return info if info else None
        
    async def quit(self):
        """エンジンを終了"""
        self._running = False
        await self.send_command("quit")
        
        if self.process:
            try:
                await asyncio.wait_for(self.process.wait(), timeout=3.0)
            except asyncio.TimeoutError:
                self.process.kill()
                await self.process.wait()
                
        if self._reader_task:
            self._reader_task.cancel()
            try:
                await self._reader_task
            except asyncio.CancelledError:
                pass
                
        logger.info("Engine terminated")


class USIEnginePool:
    """USIエンジンのプール（複数リクエスト対応）"""
    
    def __init__(self, engine_path: str, pool_size: int = 4, options: Optional[Dict[str, str]] = None):
        self.engine_path = engine_path
        self.pool_size = pool_size
        self.options = options or {}
        self.engines: List[USIEngine] = []
        self.available: Queue = Queue()
        self._engine_info: Dict[str, str] = {}
        
    async def initialize(self):
        """エンジンプールを初期化"""
        for i in range(self.pool_size):
            engine = USIEngine(self.engine_path)
            await engine.start()
            info = await engine.initialize()
            
            if i == 0:
                self._engine_info = info
                
            # オプション設定
            for name, value in self.options.items():
                await engine.set_option(name, value)
                
            self.engines.append(engine)
            await self.available.put(engine)
            
        logger.info(f"Engine pool initialized with {self.pool_size} engines")
        
    async def acquire(self) -> USIEngine:
        """エンジンを取得"""
        return await self.available.get()
        
    async def release(self, engine: USIEngine):
        """エンジンを返却"""
        # usinewgameで状態をリセット
        await engine.send_command("usinewgame")
        await engine.send_command("isready")
        await engine.wait_for_response("readyok", timeout=5.0)
        
        await self.available.put(engine)
        
    async def analyze(self, sfen: Optional[str] = None, moves: Optional[List[str]] = None,
                     time_ms: int = 1000, depth: Optional[int] = None, 
                     multipv: int = 1) -> Dict:
        """局面を解析"""
        engine = await self.acquire()
        
        try:
            await engine.set_position(sfen=sfen, moves=moves)
            result = await engine.go_analyze(time_ms=time_ms, depth=depth, multipv=multipv)
            
            # レスポンス整形
            variations = []
            for var in result["variations"]:
                variations.append({
                    "move": var.get("pv", [""])[0] if var.get("pv") else "",
                    "score_cp": var.get("score_cp"),
                    "score_mate": var.get("score_mate"),
                    "depth": var.get("depth", 0),
                    "nodes": var.get("nodes"),
                    "pv": var.get("pv")
                })
                
            return {
                "bestmove": result["bestmove"],
                "variations": variations,
                "time_ms": result["time_ms"],
                "engine_name": self._engine_info.get("name", "YaneuraOu")
            }
            
        finally:
            await self.release(engine)
            
    async def search_mate(self, sfen: Optional[str] = None, moves: Optional[List[str]] = None,
                         time_ms: int = 5000) -> Dict:
        """詰み探索"""
        engine = await self.acquire()
        
        try:
            await engine.set_position(sfen=sfen, moves=moves)
            result = await engine.go_mate(time_ms=time_ms)
            return result
            
        finally:
            await self.release(engine)
            
    def is_healthy(self) -> bool:
        """プールの健全性チェック"""
        return len(self.engines) > 0 and all(e.process and e.process.returncode is None for e in self.engines)
        
    def get_engine_info(self) -> Dict:
        """エンジン情報を取得"""
        return {
            "name": self._engine_info.get("name", "YaneuraOu"),
            "author": self._engine_info.get("author", "Unknown"),
            "version": "latest",
            "options": self.options
        }
        
    async def shutdown(self):
        """全エンジンを終了"""
        for engine in self.engines:
            await engine.quit()
        logger.info("Engine pool shutdown complete")
```

## 4. docker-compose.yml

```yaml
version: '3.8'

services:
  shogi-api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: shogi-api
    ports:
      - "8000:8000"
    environment:
      - PYTHONUNBUFFERED=1
    volumes:
      # 開発時: コードをマウント（hot reload用）
      - ./app:/app
    restart: unless-stopped

volumes:
  engine-data:
```

## 5. requirements.txt

```txt
# FastAPI と ASGI サーバー（Ubuntu 24.04 Python 3.14対応）
fastapi==0.115.0
uvicorn[standard]==0.32.0
pydantic==2.9.2

# その他のユーティリティ
python-multipart==0.0.12
```

## 6. ディレクトリ構造

```
project/
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── app/
│   ├── main.py
│   └── usi_engine.py
└── README.md
```

## 7. ビルドと起動

```bash
# ディレクトリ作成
mkdir -p yaneuraou-api/app
cd yaneuraou-api

# ファイルを配置（Dockerfile, docker-compose.yml, requirements.txt, app/main.py, app/usi_engine.py）

# Docker Composeでビルド＆起動
docker-compose up --build

# バックグラウンドで起動
docker-compose up --build -d

# ログを確認
docker-compose logs -f shogi-api

# ヘルスチェック
curl http://localhost:8000/health

# 停止
docker-compose down
```

## 8. 使用例

### Python クライアントコード

```python
import requests
import json

API_BASE = "http://localhost:8000"

# 1. エンジン情報を取得
response = requests.get(f"{API_BASE}/engine/info")
print("エンジン情報:", response.json())

# 2. 平手初期局面から解析（3候補手）
analysis_request = {
    "time_ms": 3000,
    "multipv": 3
}
response = requests.post(f"{API_BASE}/analyze", json=analysis_request)
result = response.json()

print(f"\n最善手: {result['bestmove']}")
print(f"思考時間: {result['time_ms']}ms")

for i, var in enumerate(result['variations'], 1):
    score = var.get('score_cp')
    if score is not None:
        print(f"{i}. {var['move']} (評価値: {score}cp, 深さ: {var['depth']})")
    else:
        print(f"{i}. {var['move']} (詰み: {var.get('score_mate')}手)")
    if var.get('pv'):
        print(f"   読み筋: {' '.join(var['pv'][:5])}")

# 3. SFEN局面から解析
analysis_request = {
    "sfen": "lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1",
    "time_ms": 5000,
    "multipv": 1
}
response = requests.post(f"{API_BASE}/analyze", json=analysis_request)
print(f"\nSFEN局面の最善手: {response.json()['bestmove']}")

# 4. 詰み探索
mate_request = {
    "sfen": "9/9/9/9/9/9/9/4k4/4K4 b G 1",  # 簡単な詰み局面
    "time_ms": 5000
}
response = requests.post(f"{API_BASE}/mate", json=mate_request)
mate_result = response.json()

if mate_result['mate_found']:
    print(f"\n詰みあり: {mate_result['mate_length']}手詰")
    print(f"手順: {' '.join(mate_result['mate_moves'])}")
else:
    print(f"\n詰みなし: {mate_result['message']}")
```

### cURL コマンド例

```bash
# ヘルスチェック
curl http://localhost:8000/health

# エンジン情報
curl http://localhost:8000/engine/info

# 平手初期局面を解析（1秒、3候補手）
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "time_ms": 1000,
    "multipv": 3
  }' | jq

# SFEN局面から解析（固定深さ10）
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "sfen": "lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1",
    "depth": 10,
    "multipv": 1
  }' | jq

# 指し手リストから解析
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "moves": ["7g7f", "3c3d", "2g2f"],
    "time_ms": 2000,
    "multipv": 2
  }' | jq

# 詰み探索
curl -X POST http://localhost:8000/mate \
  -H "Content-Type: application/json" \
  -d '{
    "sfen": "9/9/9/9/9/9/9/4k4/4K4 b G 1",
    "time_ms": 5000
  }' | jq
```

## 9. 技術詳細

### USIプロトコルの主要コマンド

**GUI → Engine**:
- `usi` - エンジン初期化
- `isready` - 準備完了確認
- `setoption name MultiPV value 3` - MultiPV設定
- `position startpos moves 7g7f 3c3d` - 局面設定
- `go byoyomi 1000` - 秒読み1秒で探索開始
- `go depth 10` - 深さ10で探索
- `go mate 5000` - 5秒で詰み探索
- `stop` - 探索停止
- `quit` - 終了

**Engine → GUI**:
- `id name YaneuraOu` - エンジン名
- `id author Yaneurao` - 作者名
- `usiok` - 初期化完了
- `readyok` - 準備完了
- `info depth 10 score cp 156 multipv 1 pv 7g7f 3c3d` - 探索情報
- `bestmove 7g7f ponder 3c3d` - 最善手
- `checkmate G*5b 5a4b ...` - 詰み手順

### 評価値の解釈

- **score cp 100**: 1歩分の優勢（100センチポーン = 1ポーン）
- **score cp 500**: 約5歩分有利（かなり優勢）
- **score cp -200**: 2歩分不利
- **score mate 5**: 5プライ（3手）で詰み
- **score mate -6**: 6プライ（3手）で詰まされる

### MultiPV（複数候補手）の取得

`setoption name MultiPV value 3` で3つの候補手を取得。エンジンは次のように複数の`info`行を出力:

```
info depth 10 score cp 156 multipv 1 pv 7g7f 3c3d
info depth 10 score cp 145 multipv 2 pv 2g2f 8c8d
info depth 10 score cp 132 multipv 3 pv 5g5f 5c5d
```

### 詰み探索（mate）の実行

```python
# go mate 5000 を送信（5秒で詰み探索）
# レスポンスは checkmate コマンド:
# checkmate G*5b 5a4b G*5c 4b3b G*4c  # 詰み手順
# checkmate nomate                    # 詰みなし
# checkmate timeout                   # タイムアウト
```

## 10. トラブルシューティング

### エンジンが起動しない
- 実行権限を確認: コンテナ内で `ls -la /engine/YaneuraOu`
- 評価関数ファイルの存在確認: `ls -la /engine/eval/nn.bin`
- CPU命令セット確認: AVX2非対応なら Dockerfileの `TARGET_CPU=SSE42` でリビルド

### 評価関数ファイルが見つからない
```bash
# コンテナに入って確認
docker-compose exec shogi-api bash
ls -la /engine/eval/

# 手動でダウンロード
cd /engine/eval
wget https://github.com/yaneurao/YaneuraOu/releases/download/v7.6.3/eval.zip
unzip eval.zip
```

### 応答が遅い
- `USI_Hash`を増やす（docker-compose.ymlのoptions）
- `pool_size`を増やして並列処理を改善
- `time_ms`を短くして探索時間を制限

### メモリ不足
- `USI_Hash`を減らす（256MB → 128MB）
- `pool_size`を減らす（4 → 2）

### Python 3.14での互換性問題
Ubuntu 24.04はPython 3.14がデフォルトです。`--break-system-packages`フラグでpipインストールを許可しています。

## まとめ

本実装は、やねうら王（水匠5評価関数）を**Ubuntu 24.04（Python 3.14）**ベースの**マルチステージDockerビルド**で最適化し、**FastAPIの非同期処理**でUSIプロトコル通信を実装したローカル開発用REST APIです。**エンジンプール**により複数リクエストを効率的に処理し、**MultiPV**で複数候補手、**mate探索**で詰み手順を取得できます。