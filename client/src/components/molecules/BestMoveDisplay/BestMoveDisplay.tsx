import type { BestMoveContent } from "../../../generated/graphql/types";
import { formatMoveToJapanese, sfenToBoard } from "../../../shared/services";
import type { Board } from "../../../shared/consts";
import { Row, Accordion, Col } from "../../atoms";
import styles from "./BestMoveDisplay.css";

interface BestMoveDisplayProps {
  content: BestMoveContent;
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
  const { bestmove, variations, timeMs, sfen } = content;

  // 盤面情報を取得（駒名を表示するため）
  let board: Board | undefined;
  try {
    board = sfenToBoard(sfen);
  } catch (error) {
    console.error("Failed to parse SFEN:", error);
    // 盤面解析に失敗しても、駒名なしで続行
  }

  return (
    <div className={styles.container}>
      <Accordion
        collapsible
        header={
          <Row className={styles.header} justify="space-between" align="center">
            <h3 className={styles.title}>盤面解析結果</h3>
            <Row className={styles.meta} justify="center" align="center">
              <span className={styles.time}>
                {(timeMs / 1000).toFixed(1)}秒
              </span>
            </Row>
          </Row>
        }
      >
        <Col>
          <div className={styles.bestMove}>
            <span className={styles.label}>最善手:</span>
            <span className={styles.move}>
              {formatMoveToJapanese(bestmove, board)}
            </span>
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
                        {formatMoveToJapanese(variation.move, board)}
                      </span>
                      <span className={styles.score}>
                        {formatScore(variation.scoreCp, variation.scoreMate)}
                      </span>
                      <span className={styles.depth}>
                        深度: {variation.depth}
                      </span>
                    </div>
                    {variation.pv && variation.pv.length > 0 && (
                      <div className={styles.pv}>
                        <span className={styles.pvLabel}>読み筋</span>
                        <span className={styles.pvMoves}>
                          {variation.pv
                            .slice(0, 5)
                            .map((m) => formatMoveToJapanese(m, board))
                            .join(" → ")}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Col>
      </Accordion>
    </div>
  );
}
