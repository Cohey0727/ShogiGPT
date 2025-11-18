import type {
  EvaluateMatchStateResult,
  MutationResolvers,
} from "../../generated/graphql/types";
import { db } from "../../lib/db";
import { analyzePositionAnalyzePost } from "../../generated/shogi-api";
import { MessageContentsSchema } from "../../shared/schemas/chatMessage";

/**
 * 既に保存されたMatchStateに対して非同期で盤面評価を行う
 */
export const evaluateMatchState: MutationResolvers["evaluateMatchState"] =
  async (_parent, { input }) => {
    // 1. MatchStateを取得
    const matchState = await db.matchState.findUnique({
      where: { matchId_index: { matchId: input.matchId, index: input.index } },
      include: { match: true },
    });

    if (!matchState) {
      throw new Error(
        `MatchState not found: ${input.matchId}, index: ${input.index}`
      );
    }

    // 2. 思考中のチャットメッセージを作成（isPartial: true）
    const thinkingContents = MessageContentsSchema.parse([
      { type: "markdown", content: "思考中..." },
    ]);
    const thinkingMessage = await db.chatMessage.create({
      data: {
        matchId: matchState.matchId,
        role: "ASSISTANT",
        contents: thinkingContents,
        isPartial: true,
      },
    });

    console.log("💭 Thinking message created:", thinkingMessage.id);

    // 3. 盤面を評価
    const multipv = input.multipv ?? 5;
    const timeMs = input.thinkingTime ? input.thinkingTime * 1000 : 10000;

    try {
      console.log("🔍 Analyzing position asynchronously...");
      console.log("  MultiPV:", multipv);
      console.log("  Time:", timeMs, "ms");

      const { data, error } = await analyzePositionAnalyzePost({
        body: {
          sfen: matchState.sfen,
          multipv,
          time_ms: timeMs,
          moves: null,
          depth: null,
        },
      });

      if (error || !data) {
        console.error("❌ shogi-api error:", error);
        // エラー時のメッセージ更新
        const errorContents = MessageContentsSchema.parse([
          { type: "markdown", content: "評価中にエラーが発生しました。" },
        ]);
        await db.chatMessage.update({
          where: { id: thinkingMessage.id },
          data: {
            contents: errorContents,
            isPartial: false,
          },
        });
        throw new Error("Analysis failed");
      }

      console.log("✅ Analysis complete:");
      console.log("  Best move:", data.bestmove);
      console.log("  Candidates:", data.variations.length);

      // 4. チャットメッセージを更新
      const contents = MessageContentsSchema.parse([
        {
          type: "bestmove",
          bestmove: data.bestmove,
          variations: data.variations.map((v) => ({
            move: v.move,
            scoreCp: v.score_cp,
            scoreMate: v.score_mate,
            depth: v.depth,
            nodes: v.nodes,
            pv: v.pv,
          })),
          timeMs: data.time_ms,
          engineName: data.engine_name,
        },
      ]);

      await db.chatMessage.update({
        where: { id: thinkingMessage.id },
        data: { contents, isPartial: false },
      });

      console.log("✅ Thinking message updated with evaluation result");

      // 5. BestMoveContent形式で返す
      return {
        type: "bestmove",
        bestmove: data.bestmove,
        variations: data.variations.map((v) => ({
          move: v.move,
          scoreCp: v.score_cp,
          scoreMate: v.score_mate,
          depth: v.depth,
          nodes: v.nodes,
          pv: v.pv,
        })),
        timeMs: data.time_ms,
        engineName: data.engine_name,
      } satisfies EvaluateMatchStateResult;
    } catch (error) {
      console.error("❌ Unexpected error during evaluation:", error);
      // エラー時のメッセージ更新
      const unexpectedErrorContents = MessageContentsSchema.parse([
        {
          type: "markdown",
          content: "評価中に予期しないエラーが発生しました。",
        },
      ]);
      await db.chatMessage.update({
        where: { id: thinkingMessage.id },
        data: { contents: unexpectedErrorContents, isPartial: false },
      });
      throw error;
    }
  };
