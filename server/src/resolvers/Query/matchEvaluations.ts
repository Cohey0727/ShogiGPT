import type { QueryResolvers } from "../../generated/graphql/types";
import { db } from "../../lib/db";

interface Variation {
  scoreCp?: number | null;
  scoreMate?: number | null;
}

/**
 * 対局の評価値遷移を取得するresolver
 * matchIdを受け取り、対局のstatesからsfenを取得し、
 * それぞれのsfenに対応する評価値をindex順に返す
 */
export const matchEvaluations: QueryResolvers["matchEvaluations"] = async (_, { matchId }) => {
  // 対局のstatesをindex順に取得
  const matchStates = await db.matchState.findMany({
    where: { matchId },
    orderBy: { index: "asc" },
    select: { index: true, sfen: true },
  });

  if (matchStates.length === 0) {
    return [];
  }

  // 全sfenを取得
  const sfens = matchStates.map((state) => state.sfen);

  // sfenに対応する評価値を一括取得
  const evaluations = await db.evaluation.findMany({
    where: { sfen: { in: sfens } },
    select: { sfen: true, score: true, variations: true },
  });

  // sfenをキーにした評価値マップを作成
  const evaluationMap = new Map(evaluations.map((e) => [e.sfen, e]));

  // index順に評価値を返す
  return matchStates.map((state) => {
    const evaluation = evaluationMap.get(state.sfen);

    if (!evaluation) {
      return {
        moveIndex: state.index,
        scoreCp: null,
        scoreMate: null,
      };
    }

    // variationsから詰み手数を取得（もしあれば）
    let scoreMate: number | null = null;
    const variations = evaluation.variations as Variation[] | null;

    if (variations && variations.length > 0) {
      scoreMate = variations[0].scoreMate ?? null;
    }

    return {
      moveIndex: state.index,
      scoreCp: evaluation.score,
      scoreMate,
    };
  });
};
