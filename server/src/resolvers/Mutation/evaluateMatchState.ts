import type {
  EvaluateMatchStateResult,
  MutationResolvers,
} from "../../generated/graphql/types";
import { db } from "../../lib/db";
import { analyzePositionAnalyzePost } from "../../generated/shogi-api";
import {
  MessageContentsSchema,
  type MessageContents,
} from "../../shared/schemas/chatMessage";

/**
 * 既に保存されたMatchStateに対して非同期で盤面評価を行う
 */
export const evaluateMatchState: MutationResolvers["evaluateMatchState"] =
  async (_parent, { input }) => {
    console.log("📥 evaluateMatchState mutation called");
    console.log("  Match ID:", input.matchId);
    console.log("  Index:", input.index);

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

    console.log("✅ Match state found");
    console.log("  Match ID:", matchState.matchId);
    console.log("  Index:", matchState.index);
    console.log("  Move:", matchState.moveNotation ?? "initial position");
    console.log("  Player:", matchState.player);
    console.log("  SFEN:", matchState.sfen);

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

    const matchStateId = `${matchState.matchId}:${matchState.index}`;
    const respond = (success: boolean, message: DbChatMessage) => ({
      success,
      matchStateId,
      thinkingMessage: toGraphQLChatMessage(message),
    });

    // 3. 非同期で盤面評価を実行
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
        const errorMessage = await db.chatMessage.update({
          where: { id: thinkingMessage.id },
          data: {
            contents: errorContents,
            isPartial: false,
          },
        });
        return respond(false, errorMessage);
      }

      console.log("✅ Analysis complete:");
      console.log("  Best move:", data.bestmove);
      console.log("  Candidates:", data.variations.length);

      // 評価結果をフォーマット
      const resultText = formatEvaluationResult(data);

      // チャットメッセージのコンテンツを作成してバリデーション
      const contents = MessageContentsSchema.parse([
        {
          type: "markdown",
          content: resultText,
        },
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

      // チャットメッセージを更新
      const completedThinkingMessage = await db.chatMessage.update({
        where: { id: thinkingMessage.id },
        data: { contents, isPartial: false },
      });

      console.log("✅ Thinking message updated with evaluation result");

      return respond(true, completedThinkingMessage);
    } catch (error) {
      console.error("❌ Unexpected error during evaluation:", error);
      // エラー時のメッセージ更新
      const unexpectedErrorContents = MessageContentsSchema.parse([
        {
          type: "markdown",
          content: "評価中に予期しないエラーが発生しました。",
        },
      ]);
      const unexpectedMessage = await db.chatMessage.update({
        where: { id: thinkingMessage.id },
        data: {
          contents: unexpectedErrorContents,
          isPartial: false,
        },
      });
      return respond(false, unexpectedMessage);
    }
  };

type DbChatMessage = Awaited<ReturnType<typeof db.chatMessage.create>>;

function toGraphQLChatMessage(message: DbChatMessage) {
  return {
    id: message.id,
    matchId: message.matchId,
    role: message.role,
    contents: message.contents as MessageContents,
    isPartial: message.isPartial,
    createdAt: message.createdAt.toISOString(),
  } satisfies EvaluateMatchStateResult["thinkingMessage"];
}

/**
 * 評価結果を人間が読みやすい形式にフォーマット
 */
function formatEvaluationResult(data: {
  bestmove: string;
  variations: Array<{
    move: string;
    score_cp?: number | null;
    score_mate?: number | null;
    depth: number;
    nodes?: number | null;
    pv?: string[] | null;
  }>;
}): string {
  const lines: string[] = [];

  lines.push("📊 盤面評価結果\n");
  lines.push(`最善手: ${formatMoveToJapanese(data.bestmove)}\n`);

  if (data.variations.length > 0) {
    lines.push("\n候補手:");
    data.variations.forEach((variation, index) => {
      const rank = index + 1;
      const scoreText = formatScore(variation.score_cp, variation.score_mate);
      const moveJp = formatMoveToJapanese(variation.move);
      const pvText = variation.pv
        ? variation.pv
            .slice(0, 3)
            .map((m) => formatMoveToJapanese(m))
            .join(" → ")
        : "";
      lines.push(
        `${rank}. ${moveJp} (${scoreText})${
          pvText ? `\n   読み筋: ${pvText}` : ""
        }`
      );
    });
  }

  return lines.join("\n");
}

/**
 * USI形式の指し手を日本語形式に変換
 * 例: "7g7f" → "7七-7六", "2g2f" → "2七-2六", "G*5e" → "金打5五"
 */
function formatMoveToJapanese(usiMove: string): string {
  // 駒打ちの場合（例: G*5e）
  if (usiMove.includes("*")) {
    const [piece, to] = usiMove.split("*");
    const pieceName = getPieceNameJapanese(piece);
    const toJp = convertPositionToJapanese(to);
    return `${pieceName}打${toJp}`;
  }

  // 通常の移動（例: 7g7f, 8h2b+）
  const isPromotion = usiMove.endsWith("+");
  const moveWithoutPromotion = isPromotion ? usiMove.slice(0, -1) : usiMove;

  if (moveWithoutPromotion.length >= 4) {
    const from = moveWithoutPromotion.substring(0, 2);
    const to = moveWithoutPromotion.substring(2, 4);
    const fromJp = convertPositionToJapanese(from);
    const toJp = convertPositionToJapanese(to);

    if (isPromotion) {
      return `${fromJp}-${toJp}成`;
    }
    return `${fromJp}-${toJp}`;
  }

  // パースできない場合はそのまま返す
  return usiMove;
}

/**
 * USI形式の座標を日本語形式に変換
 * 例: "7g" → "7七", "5e" → "5五"
 */
function convertPositionToJapanese(position: string): string {
  if (position.length !== 2) return position;

  const file = position[0]; // 筋（1-9）
  const rank = position[1]; // 段（a-i）

  const rankMap: { [key: string]: string } = {
    a: "一",
    b: "二",
    c: "三",
    d: "四",
    e: "五",
    f: "六",
    g: "七",
    h: "八",
    i: "九",
  };

  const rankJp = rankMap[rank] || rank;
  return `${file}${rankJp}`;
}

/**
 * USI形式の駒名を日本語に変換
 */
function getPieceNameJapanese(usiPiece: string): string {
  const pieceMap: { [key: string]: string } = {
    P: "歩",
    L: "香",
    N: "桂",
    S: "銀",
    G: "金",
    B: "角",
    R: "飛",
    K: "玉",
    p: "歩",
    l: "香",
    n: "桂",
    s: "銀",
    g: "金",
    b: "角",
    r: "飛",
    k: "玉",
  };

  return pieceMap[usiPiece] || usiPiece;
}

/**
 * スコアをフォーマット
 */
function formatScore(
  scoreCp: number | null | undefined,
  scoreMate: number | null | undefined
): string {
  if (scoreMate !== null && scoreMate !== undefined) {
    return `詰み${scoreMate}手`;
  }
  if (scoreCp !== null && scoreCp !== undefined) {
    const signedScore = scoreCp > 0 ? `+${scoreCp}` : `${scoreCp}`;
    return `評価値: ${signedScore}`;
  }
  return "評価値なし";
}
