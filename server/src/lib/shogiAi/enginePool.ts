import { AsyncQueue } from "./asyncQueue";
import { UsiEngine } from "./usiEngine";
import type {
  AnalyzeRequest,
  AnalyzeResponse,
  EngineInfo,
  EnginePoolConfig,
  MateSearchRequest,
  MateSearchResponse,
} from "./types";

/**
 * USIエンジンのプール
 *
 * 複数のエンジンインスタンスを保持し、リクエスト到着順にacquire/releaseでサイクルさせる。
 * 1エンジンあたり1リクエストを直列処理し、プール全体で並列リクエストを受ける。
 */
export class UsiEnginePool {
  private readonly config: EnginePoolConfig;
  private readonly engines: UsiEngine[] = [];
  private readonly available = new AsyncQueue<UsiEngine>();
  private engineInfo: EngineInfo | null = null;

  constructor(config: EnginePoolConfig) {
    this.config = config;
  }

  /** プールを初期化する */
  async initialize(): Promise<void> {
    for (let i = 0; i < this.config.poolSize; i++) {
      const engine = new UsiEngine({
        enginePath: this.config.enginePath,
        engineCwd: this.config.engineCwd,
      });
      await engine.start();
      const info = await engine.initialize();

      if (i === 0) {
        this.engineInfo = info;
      }

      for (const [name, value] of Object.entries(this.config.options)) {
        await engine.setOption(name, value);
      }

      this.engines.push(engine);
      this.available.push(engine);
    }
  }

  /** エンジンを1台取得する（空きがなければ待機） */
  private async acquire(): Promise<UsiEngine> {
    // 実質無制限に待つ（タイムアウト1時間）
    const engine = await this.available.get(60 * 60 * 1000);
    if (!engine) {
      throw new Error("Failed to acquire an engine from the pool");
    }
    return engine;
  }

  /** エンジンを返却する。状態をリセットしてからキューに戻す */
  private async release(engine: UsiEngine): Promise<void> {
    try {
      await engine.sendCommand("usinewgame");
      await engine.sendCommand("isready");
      await engine.waitForResponse("readyok", 5_000);
    } catch (error: unknown) {
      console.error("Failed to reset engine on release:", error);
    }
    this.available.push(engine);
  }

  /** 局面解析を実行する */
  async analyze(request: AnalyzeRequest): Promise<AnalyzeResponse> {
    const engine = await this.acquire();
    try {
      await engine.setPosition({ sfen: request.sfen, moves: request.moves });
      return await engine.goAnalyze({
        timeMs: request.timeMs,
        depth: request.depth,
        multipv: request.multipv ?? 1,
      });
    } finally {
      await this.release(engine);
    }
  }

  /** 詰み探索を実行する */
  async searchMate(request: MateSearchRequest): Promise<MateSearchResponse> {
    const engine = await this.acquire();
    try {
      await engine.setPosition({ sfen: request.sfen, moves: request.moves });
      return await engine.goMate(request.timeMs ?? 5000);
    } finally {
      await this.release(engine);
    }
  }

  /** プールの健全性をチェックする */
  isHealthy(): boolean {
    return this.engines.length > 0 && this.engines.every((e) => e.isAlive());
  }

  /** エンジン情報を取得する */
  getEngineInfo(): EngineInfo {
    if (this.engineInfo) {
      return {
        ...this.engineInfo,
        options: { ...this.config.options },
      };
    }
    return {
      name: "YaneuraOu",
      author: "Unknown",
      version: "latest",
      options: { ...this.config.options },
    };
  }

  /** 全エンジンを停止する */
  async shutdown(): Promise<void> {
    this.available.close();
    await Promise.all(this.engines.map((engine) => engine.quit()));
  }
}
