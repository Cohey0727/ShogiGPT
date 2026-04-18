import { and, eq, inArray } from "drizzle-orm";
import { db } from "../db";
import { evaluations, type Evaluation } from "../db/schema";
import { newId } from "../db/ids";
import { getShogiAiPool } from "./shogiAi";

/**
 * 局面評価結果の型定義
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
 * 局面を評価する（キャッシュ機能付き）
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
  const cached = await db.query.evaluations.findFirst({
    where: and(eq(evaluations.sfen, sfen), eq(evaluations.engineName, engineName)),
  });

  if (cached) {
    console.log("✅ Cache hit! Using cached evaluation:", cached.id);
    const variations = cached.variations as EvaluationResult["variations"];
    return {
      evaluation: cached,
      bestmove: variations[0]?.move ?? "",
      engineName: cached.engineName,
      timeMs: 0,
      variations,
    };
  }

  const pool = getShogiAiPool();
  const data = await pool.analyze({
    sfen,
    multipv,
    timeMs,
    moves: null,
    depth: null,
  });

  const variations = data.variations.map((v) => ({
    move: v.move,
    scoreCp: v.scoreCp ?? null,
    scoreMate: v.scoreMate ?? null,
    depth: v.depth,
    nodes: v.nodes ?? 0,
    pv: v.pv ?? [],
  }));

  const bestVariation = variations[0];
  const score =
    bestVariation?.scoreMate !== null && bestVariation?.scoreMate !== undefined
      ? 10000 * bestVariation.scoreMate
      : (bestVariation?.scoreCp ?? 0);

  // API呼び出し後、保存前にもう一度キャッシュをチェック
  const existing = await db.query.evaluations.findFirst({
    where: and(eq(evaluations.sfen, sfen), eq(evaluations.engineName, data.engineName)),
  });

  if (existing) {
    return {
      evaluation: existing,
      bestmove: data.bestmove,
      engineName: data.engineName,
      timeMs: data.timeMs,
      variations,
    };
  }

  const now = new Date();
  const [inserted] = await db
    .insert(evaluations)
    .values({
      id: newId(),
      sfen,
      engineName: data.engineName,
      score,
      variations,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return {
    evaluation: inserted,
    bestmove: data.bestmove,
    engineName: data.engineName,
    timeMs: data.timeMs,
    variations,
  };
}

/**
 * 複数局面の評価結果を一括取得する
 */
export async function findEvaluationsBySfens(sfens: string[]): Promise<Evaluation[]> {
  if (sfens.length === 0) return [];
  return db.query.evaluations.findMany({
    where: inArray(evaluations.sfen, sfens),
  });
}
