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
