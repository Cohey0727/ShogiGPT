import { db } from "../lib/db";
import { MessageContentsSchema } from "../shared/schemas/chatMessage";
import { generateBestMoveCommentary } from "../lib/deepseek";
import { evaluatePosition } from "../lib/evaluatePosition";
import { sfenToBoard } from "../shared/services/sfenToBoard";
import { applyUsiMove } from "../shared/services/applyUsiMove";
import { boardToSfen } from "../shared/services/boardToSfen";

interface EvaluateAndApplyAiMoveParams {
  matchId: string;
  index: number;
  multipv?: number;
  thinkingTime?: number;
  applyBestMove: boolean;
}

/**
 * 既に保存されたMatchStateに対して非同期で盤面評価を行い、
 * applyBestMoveがtrueの場合は最善手を適用する
 */
export async function evaluateAndApplyAiMove(params: EvaluateAndApplyAiMoveParams): Promise<void> {
  const { matchId, index, multipv = 5, thinkingTime, applyBestMove } = params;

  // 1. MatchStateを取得
  const matchState = await db.matchState.findUnique({
    where: { matchId_index: { matchId, index } },
    include: { match: true },
  });

  if (!matchState) {
    throw new Error(`MatchState not found: ${matchId}, index: ${index}`);
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
  const timeMs = thinkingTime ? thinkingTime * 1000 : 10000;

  try {
    // 盤面を評価（キャッシュがあればそれを使用）
    const evaluationResult = await evaluatePosition(matchState.sfen, multipv, timeMs);

    // MatchStateに評価結果IDを保存
    await db.matchState.update({
      where: {
        matchId_index: { matchId, index },
      },
      data: { evaluationId: evaluationResult.evaluation.id },
    });
    console.log("💾 Linked evaluation to MatchState");

    // 現在の評価値を取得
    const currentEvaluation = evaluationResult.variations[0]?.scoreCp ?? null;

    // 直前の局面の評価値を取得
    let previousEvaluation: number | null = null;
    if (index > 0) {
      const previousState = await db.matchState.findFirst({
        where: {
          matchId,
          index: { lt: index },
          evaluationId: { not: null },
        },
        orderBy: {
          index: "desc",
        },
        include: { evaluation: true },
      });
      if (previousState?.evaluation) {
        const prevVariations = previousState.evaluation.variations as Array<{
          scoreCp?: number | null;
        }>;
        previousEvaluation = prevVariations[0]?.scoreCp ?? null;
      }
      console.log("📊 Previous evaluation:", previousEvaluation);
    }

    // 4. DEEPSEEKで人間らしい解説を生成
    console.log("💬 Generating commentary with DEEPSEEK...");
    let commentary = "";
    try {
      commentary = await generateBestMoveCommentary({
        sfen: matchState.sfen,
        bestmove: evaluationResult.bestmove,
        variations: evaluationResult.variations,
        engineName: evaluationResult.engineName,
        timeMs: evaluationResult.timeMs,
        previousEvaluation,
        currentEvaluation,
      });
      console.log("✅ Commentary generated successfully");
    } catch (error) {
      console.error("⚠️ Failed to generate commentary:", error);
      commentary = "## 局面の評価\n\nこの局面の解析が完了しました。";
    }

    // 5. チャットメッセージを更新（markdownとbestmoveの両方を含める）
    const contents = MessageContentsSchema.parse([
      {
        type: "markdown",
        content: commentary,
      },
      {
        type: "bestmove",
        bestmove: evaluationResult.bestmove,
        variations: evaluationResult.variations,
        timeMs: evaluationResult.timeMs,
        engineName: evaluationResult.engineName,
        sfen: matchState.sfen,
      },
    ]);

    await db.chatMessage.update({
      where: { id: thinkingMessage.id },
      data: { contents, isPartial: false },
    });

    console.log("✅ Thinking message updated with evaluation result");

    // 6. applyBestMoveがtrueの場合、最善手を適用した次の局面を保存
    if (applyBestMove) {
      try {
        const currentBoard = sfenToBoard(matchState.sfen);
        const newBoardWithAiMove = applyUsiMove(currentBoard, evaluationResult.bestmove);
        const aiMoveIndex = index + 1;
        const aiSfen = boardToSfen(newBoardWithAiMove);

        await db.matchState.create({
          data: {
            matchId: matchState.matchId,
            index: aiMoveIndex,
            usiMove: evaluationResult.bestmove,
            sfen: aiSfen,
            thinkingTime: Math.floor(evaluationResult.timeMs / 1000),
          },
        });

        console.log(`✅ Applied best move and created MatchState at index ${aiMoveIndex}`);
      } catch (error) {
        console.error("⚠️ Failed to apply best move:", error);
        // エラーが発生しても評価結果は返す
      }
    }
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
}
