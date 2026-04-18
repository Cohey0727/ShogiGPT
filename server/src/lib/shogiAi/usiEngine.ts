import { AsyncQueue } from "./asyncQueue";
import type { AnalyzeResponse, EngineInfo, MateSearchResponse, MoveInfo } from "./types";

/**
 * USIエンジンとの通信を管理する単一エンジンインスタンス
 *
 * Bun.spawnでYaneuraOuプロセスを起動し、stdin/stdoutをパイプで接続する。
 * バックグラウンドで標準出力を読み続けて行単位でキューに積み、コマンドごとに必要な行を取り出す。
 */
export class UsiEngine {
  private readonly enginePath: string;
  private readonly engineCwd: string;
  private readonly outputQueue = new AsyncQueue<string>();
  private process: ReturnType<typeof Bun.spawn> | null = null;
  private readerPromise: Promise<void> | null = null;
  private running = false;
  private info: EngineInfo = {
    name: "YaneuraOu",
    author: "Unknown",
    version: "latest",
    options: {},
  };

  constructor(params: { enginePath: string; engineCwd: string }) {
    this.enginePath = params.enginePath;
    this.engineCwd = params.engineCwd;
  }

  /** エンジンプロセスを起動する */
  async start(): Promise<void> {
    this.process = Bun.spawn([this.enginePath], {
      stdin: "pipe",
      stdout: "pipe",
      stderr: "pipe",
      cwd: this.engineCwd,
    });
    this.running = true;
    this.readerPromise = this.readOutputLoop();
  }

  /** エンジンの出力を非同期に読み込み、行単位でキューに積む */
  private async readOutputLoop(): Promise<void> {
    if (!this.process?.stdout) return;

    const reader = (this.process.stdout as ReadableStream<Uint8Array>).getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (this.running) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, newlineIdx).trim();
          buffer = buffer.slice(newlineIdx + 1);
          if (line.length > 0) {
            this.outputQueue.push(line);
          }
        }
      }
    } catch {
      // プロセス終了時は握りつぶす
    } finally {
      reader.releaseLock();
      this.outputQueue.close();
    }
  }

  /** エンジンにコマンドを1行送信する */
  async sendCommand(command: string): Promise<void> {
    const stdin = this.process?.stdin;
    if (!stdin || typeof stdin === "number") {
      throw new Error("Engine process stdin is not available");
    }
    stdin.write(`${command}\n`);
    await stdin.flush();
  }

  /**
   * 指定した応答が来るまで待機する
   *
   * @param expected - 期待する1行の文字列（完全一致）
   * @param timeoutMs - タイムアウト（ミリ秒）
   * @returns 応答を受け取ったらtrue
   */
  async waitForResponse(expected: string, timeoutMs: number): Promise<boolean> {
    const start = Date.now();
    const buffered: string[] = [];

    while (Date.now() - start < timeoutMs) {
      const line = await this.outputQueue.get(500);
      if (line === null) continue;

      if (line === expected) {
        for (const b of buffered) this.outputQueue.push(b);
        return true;
      }
      buffered.push(line);
    }

    for (const b of buffered) this.outputQueue.push(b);
    return false;
  }

  /** usi, isready を送信してエンジンを初期化する */
  async initialize(): Promise<EngineInfo> {
    await this.sendCommand("usi");

    const infoDeadline = Date.now() + 10_000;
    while (Date.now() < infoDeadline) {
      const line = await this.outputQueue.get(500);
      if (line === null) continue;

      if (line.startsWith("id name")) {
        this.info = { ...this.info, name: line.slice(8).trim() };
      } else if (line.startsWith("id author")) {
        this.info = { ...this.info, author: line.slice(10).trim() };
      } else if (line === "usiok") {
        break;
      }
    }

    await this.sendCommand("isready");
    await this.waitForResponse("readyok", 10_000);
    return this.info;
  }

  /** エンジンオプションを設定する */
  async setOption(name: string, value: string): Promise<void> {
    await this.sendCommand(`setoption name ${name} value ${value}`);
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  /** 局面を設定する */
  async setPosition(params: { sfen?: string | null; moves?: string[] | null }): Promise<void> {
    const { sfen, moves } = params;
    let cmd = sfen ? `position sfen ${sfen}` : "position startpos";
    if (moves && moves.length > 0) {
      cmd += ` moves ${moves.join(" ")}`;
    }
    await this.sendCommand(cmd);
  }

  /**
   * 局面解析を実行してbestmoveと候補手情報を取得する
   */
  async goAnalyze(params: {
    timeMs?: number | null;
    depth?: number | null;
    multipv: number;
  }): Promise<AnalyzeResponse> {
    const { timeMs, depth, multipv } = params;

    // MultiPVは状態が残るので常に明示的に設定する
    await this.setOption("MultiPV", String(multipv));

    let cmd = "go";
    if (depth) {
      cmd += ` depth ${depth}`;
    } else if (timeMs) {
      cmd += ` byoyomi ${timeMs}`;
    } else {
      cmd += " byoyomi 1000";
    }
    await this.sendCommand(cmd);

    const variations = new Map<number, MoveInfo>();
    let bestmove: string | null = null;
    const startedAt = Date.now();
    const readTimeoutMs = Math.max(30_000, (timeMs ?? 1000) + 5_000);
    const deadline = startedAt + readTimeoutMs;

    while (Date.now() < deadline) {
      const line = await this.outputQueue.get(500);
      if (line === null) continue;

      if (line.startsWith("info")) {
        const info = parseInfoLine(line);
        if (info && info.multipv !== undefined) {
          variations.set(info.multipv, info.move);
        }
      } else if (line.startsWith("bestmove")) {
        const parts = line.split(/\s+/);
        bestmove = parts[1] ?? null;
        break;
      }
    }

    const elapsedMs = Date.now() - startedAt;
    const sortedVariations = [...variations.entries()].sort(([a], [b]) => a - b).map(([, v]) => v);

    return {
      bestmove: bestmove ?? "resign",
      variations: sortedVariations,
      timeMs: elapsedMs,
      engineName: this.info.name,
    };
  }

  /** 詰み探索を実行する */
  async goMate(timeMs: number): Promise<MateSearchResponse> {
    await this.sendCommand(`go mate ${timeMs}`);

    const deadline = Date.now() + timeMs + 5_000;

    while (Date.now() < deadline) {
      const line = await this.outputQueue.get(500);
      if (line === null) continue;

      if (line.startsWith("checkmate")) {
        const parts = line.split(/\s+/);

        if (parts.length === 1 || parts[1] === "nomate") {
          return { mateFound: false, message: "No mate found" };
        }
        if (parts[1] === "timeout") {
          return { mateFound: false, message: "Search timeout" };
        }
        if (parts[1] === "notimplemented") {
          return { mateFound: false, message: "Mate search not implemented" };
        }

        const mateMoves = parts.slice(1);
        return {
          mateFound: true,
          mateMoves,
          mateLength: mateMoves.length,
        };
      }
    }

    return { mateFound: false, message: "Mate search timeout" };
  }

  /** エンジンを終了する */
  async quit(): Promise<void> {
    this.running = false;
    try {
      await this.sendCommand("quit");
    } catch {
      // 既に閉じている場合は無視
    }

    if (this.process) {
      const exitPromise = this.process.exited;
      const timeoutPromise = new Promise<void>((resolve) => setTimeout(resolve, 3_000));
      await Promise.race([exitPromise, timeoutPromise]);

      if (this.process.exitCode === null) {
        this.process.kill();
        await this.process.exited;
      }
    }

    if (this.readerPromise) {
      await this.readerPromise.catch(() => undefined);
    }
  }

  /** プロセスが生きているか */
  isAlive(): boolean {
    return this.process !== null && this.process.exitCode === null;
  }

  /** エンジン情報を取得する */
  getInfo(): EngineInfo {
    return { ...this.info };
  }
}

interface ParsedInfo {
  multipv?: number;
  move: MoveInfo;
}

/** USIのinfo行をパースする */
function parseInfoLine(line: string): ParsedInfo | null {
  const parts = line.split(/\s+/);
  if (parts.length < 2 || parts[0] !== "info") return null;

  let depth = 0;
  let scoreCp: number | null = null;
  let scoreMate: number | null = null;
  let nodes: number | null = null;
  let multipv: number | undefined;
  let pv: string[] | null = null;

  let i = 1;
  while (i < parts.length) {
    const token = parts[i];
    if (token === "depth" && i + 1 < parts.length) {
      depth = Number.parseInt(parts[i + 1] ?? "0", 10);
      i += 2;
    } else if (token === "score" && i + 2 < parts.length) {
      const type = parts[i + 1];
      const value = Number.parseInt(parts[i + 2] ?? "0", 10);
      if (type === "cp") scoreCp = value;
      else if (type === "mate") scoreMate = value;
      i += 3;
    } else if (token === "nodes" && i + 1 < parts.length) {
      nodes = Number.parseInt(parts[i + 1] ?? "0", 10);
      i += 2;
    } else if (token === "multipv" && i + 1 < parts.length) {
      multipv = Number.parseInt(parts[i + 1] ?? "1", 10);
      i += 2;
    } else if (token === "pv") {
      pv = parts.slice(i + 1);
      break;
    } else {
      i += 1;
    }
  }

  const move = pv && pv.length > 0 ? (pv[0] ?? "") : "";

  return {
    multipv,
    move: {
      move,
      scoreCp,
      scoreMate,
      depth,
      nodes,
      pv,
    },
  };
}
