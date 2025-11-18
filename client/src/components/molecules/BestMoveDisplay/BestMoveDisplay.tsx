import type { BestMoveContent } from "../../../generated/graphql/types";
import styles from "./BestMoveDisplay.css";

interface BestMoveDisplayProps {
  content: BestMoveContent;
}

/**
 * 指し手をUSI形式から日本語形式に変換
 * 例: "7g7f" → "7七-7六", "G*5e" → "5五金打"
 */
function formatMoveToJapanese(usiMove: string): string {
  // 駒打ちの場合（例: G*5e）
  if (usiMove.includes("*")) {
    const [piece, to] = usiMove.split("*");
    const pieceName = getPieceNameJapanese(piece);
    const toJp = convertPositionToJapanese(to);
    return `${toJp}${pieceName}打`;
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
  scoreCp?: number | null,
  scoreMate?: number | null
): string {
  if (scoreMate !== null && scoreMate !== undefined) {
    return `詰み${scoreMate}手`;
  }
  if (scoreCp !== null && scoreCp !== undefined) {
    const signedScore = scoreCp > 0 ? `+${scoreCp}` : `${scoreCp}`;
    return signedScore;
  }
  return "-";
}

export function BestMoveDisplay({ content }: BestMoveDisplayProps) {
  const { bestmove, variations, timeMs, engineName } = content;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>📊 盤面解析結果</h3>
        <div className={styles.meta}>
          <span className={styles.engine}>{engineName}</span>
          <span className={styles.time}>{(timeMs / 1000).toFixed(1)}秒</span>
        </div>
      </div>

      <div className={styles.bestMove}>
        <span className={styles.label}>最善手:</span>
        <span className={styles.move}>{formatMoveToJapanese(bestmove)}</span>
      </div>

      {variations.length > 0 && (
        <div className={styles.variations}>
          <h4 className={styles.variationsTitle}>候補手:</h4>
          <div className={styles.variationsList}>
            {variations.map((variation, index) => (
              <div key={index} className={styles.variation}>
                <div className={styles.variationHeader}>
                  <span className={styles.rank}>{index + 1}.</span>
                  <span className={styles.variationMove}>
                    {formatMoveToJapanese(variation.move)}
                  </span>
                  <span className={styles.score}>
                    {formatScore(variation.scoreCp, variation.scoreMate)}
                  </span>
                  <span className={styles.depth}>深度: {variation.depth}</span>
                </div>
                {variation.pv && variation.pv.length > 0 && (
                  <div className={styles.pv}>
                    <span className={styles.pvLabel}>読み筋</span>
                    <span className={styles.pvMoves}>
                      {variation.pv
                        .slice(0, 5)
                        .map((m) => formatMoveToJapanese(m))
                        .join(" → ")}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
