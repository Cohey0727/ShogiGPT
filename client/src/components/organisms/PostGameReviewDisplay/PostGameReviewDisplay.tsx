import { useState, useCallback } from "react";
import type { PostGameAnalysisContent, TurningPoint } from "../../../shared/schemas/chatMessage";
import { sfenToBoard } from "../../../shared/services";
import { Row, Accordion, Col } from "../../atoms";
import { ShogiReplayModal } from "../ShogiReplayModal";
import styles from "./PostGameReviewDisplay.css";

interface PostGameReviewDisplayProps {
  /** 感想戦の分析結果 */
  content: PostGameAnalysisContent;
}

/**
 * 感想戦の分析結果を表示するコンポーネント
 */
export function PostGameReviewDisplay({ content }: PostGameReviewDisplayProps) {
  const { turningPoints } = content;
  const [selectedTurningPoint, setSelectedTurningPoint] = useState<TurningPoint | null>(null);

  const handleTurningPointClick = useCallback((tp: TurningPoint) => {
    setSelectedTurningPoint(tp);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedTurningPoint(null);
  }, []);

  return (
    <div className={styles.container}>
      <Accordion
        collapsible
        header={
          <Row className={styles.header} justify="space-between" align="center">
            <h3 className={styles.title}>感想戦</h3>
          </Row>
        }
      >
        <Col>
          {turningPoints.length === 0 ? (
            <div className={styles.emptyMessage}>
              この対局では大きなターニングポイントは見つかりませんでした。
            </div>
          ) : (
            <div className={styles.turningPointsList}>
              {turningPoints.map((tp, idx) => (
                <div
                  key={idx}
                  className={styles.turningPoint}
                  onClick={() => handleTurningPointClick(tp)}
                >
                  <div className={styles.turningPointHeader}>
                    <span className={styles.moveIndex}>{tp.index}手目</span>
                  </div>
                  <div className={styles.comment}>{tp.comment}</div>
                  {tp.bestMoves.length > 0 && (
                    <div className={styles.bestMovesSection}>
                      <div className={styles.bestMovesLabel}>最善手順:</div>
                      <div className={styles.bestMovesList}>
                        {tp.bestMoves.map((move, moveIdx) => (
                          <span key={moveIdx} className={styles.bestMoveItem}>
                            {moveIdx > 0 && <span className={styles.bestMoveArrow}>→</span>}
                            {move.comment}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Col>
      </Accordion>

      {selectedTurningPoint && (
        <ShogiReplayModal
          title={`${selectedTurningPoint.index}手目 - 最善手順`}
          startComment={selectedTurningPoint.comment}
          startBoard={sfenToBoard(selectedTurningPoint.sfen)}
          moves={selectedTurningPoint.bestMoves}
          open={true}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
