import type { Evaluation } from "../generated/prisma/client";
import { db } from "./db";
import { analyzePositionAnalyzePost } from "../generated/shogi-ai";

/**
 * 盤面評価結果の型定義
 */
export interface EvaluationResult {
  /** 評価結果オブジェクト */
  evaluation: Evaluation;
  /** ベストムーブ */
  bestmove: string;
  /** エンジン名 */
  engineName: string;
  /** 思考時間（ミリ秒） */
  timeMs: number;
  /** 候補手のバリエーション */
  variations: Array<{
    move: string;
    scoreCp: number | null;
    scoreMate: number | null;
    depth: number;
    nodes: number;
    pv: string[];
  }>;
}

/**
 * 盤面を評価する（キャッシュ機能付き）
 *
 * @param sfen - 評価する局面（SFEN形式）
 * @param multipv - 候補手の数
 * @param timeMs - 思考時間（ミリ秒）
 * @param engineName - エンジン名（キャッシュキーに使用、省略時はAPIから取得）
 * @returns 評価結果
 */
export async function evaluatePosition(
  sfen: string,
  multipv: number,
  timeMs: number,
  engineName: string = "Suisho5",
): Promise<EvaluationResult> {
  // エンジン名が指定されている場合、キャッシュをチェック

  const cachedEvaluation = await db.evaluation.findUnique({
    where: { sfen_engineName: { sfen, engineName } },
  });

  if (cachedEvaluation) {
    console.log("✅ Cache hit! Using cached evaluation:", cachedEvaluation.id);
    const variations = cachedEvaluation.variations as Array<{
      move: string;
      scoreCp: number | null;
      scoreMate: number | null;
      depth: number;
      nodes: number;
      pv: string[];
    }>;

    return {
      evaluation: cachedEvaluation,
      bestmove: variations[0]?.move ?? "",
      engineName: cachedEvaluation.engineName,
      timeMs: 0, // キャッシュからの取得なので時間は0
      variations,
    };
  }

  const { data, error } = await analyzePositionAnalyzePost({
    body: {
      sfen,
      multipv,
      time_ms: timeMs,
      moves: null,
      depth: null,
    },
  });

  if (error || !data) {
    console.error("❌ shogi-ai error:", error);
    throw new Error("Analysis failed");
  }

  const variations = data.variations.map((v) => ({
    move: v.move,
    scoreCp: v.score_cp ?? null,
    scoreMate: v.score_mate ?? null,
    depth: v.depth,
    nodes: v.nodes ?? 0,
    pv: v.pv ?? [],
  }));

  // 最善手のスコアを計算
  // 詰みの場合は10000 * 詰みまでの手数、通常の場合はcentipawn評価値
  const bestVariation = variations[0];
  const score =
    bestVariation?.scoreMate !== null && bestVariation?.scoreMate !== undefined
      ? 10000 * bestVariation.scoreMate
      : (bestVariation?.scoreCp ?? 0);

  // API呼び出し後、保存前にもう一度キャッシュをチェック
  const existingEvaluation = await db.evaluation.findUnique({
    where: { sfen_engineName: { sfen, engineName: data.engine_name } },
  });

  if (existingEvaluation) {
    return {
      evaluation: existingEvaluation,
      bestmove: data.bestmove,
      engineName: data.engine_name,
      timeMs: data.time_ms,
      variations,
    };
  }

  // 評価結果をEvaluationテーブルに保存
  const evaluation = await db.evaluation.create({
    data: {
      sfen,
      engineName: data.engine_name,
      score,
      variations,
    },
  });

  return {
    evaluation,
    bestmove: data.bestmove,
    engineName: data.engine_name,
    timeMs: data.time_ms,
    variations,
  };
}
