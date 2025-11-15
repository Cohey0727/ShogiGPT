import { useParams } from "wouter";
import { ShogiBoard, MatchChat } from "../../organisms";

import styles from "./MatchDetailPage.css";
import { createInitialBoard } from "../../../utils/shogi";

export function MatchDetailPage() {
  const params = useParams<{ matchId: string }>();
  const matchId = params.matchId;

  // 初期盤面を生成
  const board = createInitialBoard();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.chatSection}>
          <MatchChat matchId={matchId || "unknown"} />
        </div>

        <div className={styles.boardSection}>
          <ShogiBoard board={board} />
          <div className={styles.controls}>
            <button className={styles.controlButton}>⏮ 最初</button>
            <button className={styles.controlButton}>◀ 前へ</button>
            <button className={styles.controlButton}>▶ 次へ</button>
            <button className={styles.controlButton}>⏭ 最後</button>
          </div>
        </div>
      </div>
    </div>
  );
}
