import type { MutationResolvers } from "../../generated/graphql/types";
import { db } from "../../lib/db";
import { analyzePositionAnalyzePost } from "../../generated/shogi-api";

/**
 * 対局状態を保存し、次の候補手を取得する
 */
export const saveMatchStateAndGetCandidates: MutationResolvers["saveMatchStateAndGetCandidates"] =
  async (_parent, { input }) => {
    console.log("📥 saveMatchStateAndGetCandidates mutation called");
    console.log("  Match ID:", input.matchId);
    console.log("  Index:", input.index);
    console.log("  Move:", input.moveNotation ?? "initial position");
    console.log("  SFEN:", input.sfen);

    // 1. 対局が存在するか確認
    const match = await db.match.findUnique({
      where: { id: input.matchId },
    });

    if (!match) {
      throw new Error(`Match not found: ${input.matchId}`);
    }

    // 2. 対局状態を保存
    const matchState = await db.matchState.create({
      data: {
        matchId: input.matchId,
        index: input.index,
        moveNotation: input.moveNotation ?? null,
        sfen: input.sfen,
        thinkingTime: input.thinkingTime ?? null,
      },
    });

    console.log(
      "✅ Match state saved:",
      matchState.matchId,
      "index:",
      matchState.index
    );

    // 3. 次の候補手を取得（将棋エンジンを使用）
    const multipv = input.multipv ?? 3;
    const timeMs = input.timeMs ?? 1000;

    console.log("🔍 Analyzing position for candidates...");
    console.log("  MultiPV:", multipv);
    console.log("  Time:", timeMs, "ms");

    const { data, error } = await analyzePositionAnalyzePost({
      body: {
        sfen: input.sfen,
        multipv,
        time_ms: timeMs,
        moves: null,
        depth: null,
      },
    });

    if (error || !data) {
      console.error("❌ shogi-api error:", error);
      throw new Error(
        `Failed to analyze position: ${
          error ? JSON.stringify(error) : "No data returned"
        }`
      );
    }

    console.log("✅ Analysis complete:");
    console.log("  Best move:", data.bestmove);
    console.log("  Candidates:", data.variations.length);

    // 4. 結果を返す
    return {
      matchState: {
        matchId: matchState.matchId,
        index: matchState.index,
        moveNotation: matchState.moveNotation,
        sfen: matchState.sfen,
        thinkingTime: matchState.thinkingTime,
        createdAt: matchState.createdAt.toISOString(),
      },
      candidates: data.variations.map((v) => ({
        move: v.move,
        scoreCp: v.score_cp ?? null,
        scoreMate: v.score_mate ?? null,
        depth: v.depth,
        nodes: v.nodes ?? null,
        pv: v.pv ?? null,
      })),
    };
  };
