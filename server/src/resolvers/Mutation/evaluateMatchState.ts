import type { MutationResolvers } from "../../generated/graphql/types";
import { db } from "../../lib/db";
import { analyzePositionAnalyzePost } from "../../generated/shogi-api";
import { Player } from "../../generated/prisma";

/**
 * 対局状態を保存し、非同期で盤面評価を行う
 */
export const evaluateMatchState: MutationResolvers["evaluateMatchState"] =
  async (_parent, { input }) => {
    console.log("📥 evaluateMatchState mutation called");
    console.log("  Match ID:", input.matchId);
    console.log("  Index:", input.index);
    console.log("  Move:", input.moveNotation ?? "initial position");
    console.log("  Player:", input.player);
    console.log("  SFEN:", input.sfen);

    // 1. 対局が存在するか確認
    const match = await db.match.findUnique({
      where: { id: input.matchId },
    });

    if (!match) {
      throw new Error(`Match not found: ${input.matchId}`);
    }

    // 2. プレイヤー文字列をPrisma Playerに変換
    const player =
      input.player.toUpperCase() === "SENTE" ? Player.SENTE : Player.GOTE;

    // 3. 対局状態を保存
    const matchState = await db.matchState.create({
      data: {
        matchId: input.matchId,
        index: input.index,
        moveNotation: input.moveNotation ?? null,
        player,
        sfen: input.sfen,
        thinkingTime: input.thinkingTime ?? null,
      },
    });

    console.log("✅ Match state saved:", matchState.id);

    // 4. 思考中のチャットメッセージを作成（isPartial: true）
    const thinkingMessage = await db.chatMessage.create({
      data: {
        matchId: input.matchId,
        role: "SYSTEM",
        content: "思考中...",
        isPartial: true,
      },
    });

    console.log("💭 Thinking message created:", thinkingMessage.id);

    // 5. 非同期で盤面評価を実行
    const multipv = input.multipv ?? 5;
    const timeMs = input.timeMs ?? 10000;

    (async () => {
      try {
        console.log("🔍 Analyzing position asynchronously...");
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
          // エラー時のメッセージ更新
          await db.chatMessage.update({
            where: { id: thinkingMessage.id },
            data: {
              content: "評価中にエラーが発生しました。",
              isPartial: false,
            },
          });
          return;
        }

        console.log("✅ Analysis complete:");
        console.log("  Best move:", data.bestmove);
        console.log("  Candidates:", data.variations.length);

        // 評価結果をフォーマット
        const resultText = formatEvaluationResult(data);

        // メタデータに最善手とその他の情報を保存
        const metadata = {
          bestmove: data.bestmove,
          variations: data.variations.map((v) => ({
            move: v.move,
            score_cp: v.score_cp,
            score_mate: v.score_mate,
            depth: v.depth,
          })),
        };

        // チャットメッセージを更新
        await db.chatMessage.update({
          where: { id: thinkingMessage.id },
          data: {
            content: resultText,
            isPartial: false,
            metadata: JSON.stringify(metadata),
          },
        });

        console.log("✅ Thinking message updated with evaluation result");
      } catch (error) {
        console.error("❌ Unexpected error during evaluation:", error);
        // エラー時のメッセージ更新
        await db.chatMessage.update({
          where: { id: thinkingMessage.id },
          data: {
            content: "評価中に予期しないエラーが発生しました。",
            isPartial: false,
          },
        });
      }
    })();

    // 6. 即座にレスポンスを返す
    return {
      success: true,
      matchState: {
        id: matchState.id,
        matchId: matchState.matchId,
        index: matchState.index,
        moveNotation: matchState.moveNotation,
        player: matchState.player,
        sfen: matchState.sfen,
        thinkingTime: matchState.thinkingTime,
        createdAt: matchState.createdAt.toISOString(),
      },
      thinkingMessage: {
        id: thinkingMessage.id,
        matchId: thinkingMessage.matchId,
        role: thinkingMessage.role,
        content: thinkingMessage.content,
        isPartial: thinkingMessage.isPartial,
        createdAt: thinkingMessage.createdAt.toISOString(),
      },
    };
  };

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
        `${rank}. ${moveJp} (${scoreText})${pvText ? `\n   読み筋: ${pvText}` : ""}`
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
