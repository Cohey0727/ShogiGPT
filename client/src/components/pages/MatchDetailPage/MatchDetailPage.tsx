import { useParams } from "wouter";
import { ShogiBoard, MatchChat, PieceStand } from "../../organisms";

import styles from "./MatchDetailPage.css";
import { createInitialBoard } from "../../../utils/shogi";

export function MatchDetailPage() {
  const params = useParams<{ matchId: string }>();
  const matchId = params.matchId;

  // 初期盤面を生成
  const board = createInitialBoard();

  // テスト用の持ち駒
  const testCapturedPieces = {
    pawn: 3,
    lance: 2,
    knight: 1,
    silver: 2,
    gold: 1,
    bishop: 1,
    rook: 1,
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.chatSection}>
          <MatchChat matchId={matchId || "unknown"} />
        </div>

        <div className={styles.boardSection}>
          <div className={styles.gotePieceStand}>
            <PieceStand player="gote" capturedPieces={testCapturedPieces} />
          </div>
          <ShogiBoard board={board} />
          <div className={styles.sentePieceStand}>
            <PieceStand player="sente" capturedPieces={testCapturedPieces} />
          </div>
        </div>
      </div>
    </div>
  );
}
