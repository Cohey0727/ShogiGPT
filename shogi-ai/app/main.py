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
