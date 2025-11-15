import { Link, useParams } from "wouter";
import styles from "./MatchDetailPage.css";

export function MatchDetailPage() {
  const params = useParams<{ matchId: string }>();
  const matchId = params.matchId;

  // ダミーデータ
  const matchData = {
    id: matchId,
    player1: "田中太郎",
    player2: "佐藤花子",
    status: "進行中",
    date: "2025-01-15",
    time: "14:30",
    moves: 42,
    currentTurn: "先手",
  };

  const moves = [
    "1. ☗7六歩",
    "2. ☖3四歩",
    "3. ☗2六歩",
    "4. ☖8四歩",
    "5. ☗2五歩",
    "...",
  ];

  return (
    <div className={styles.container}>
      <Link href="/matches">
        <button className={styles.backButton}>← 対局一覧に戻る</button>
      </Link>

      <div className={styles.header}>
        <div className={styles.matchId}>#{matchData.id}</div>
        <h1 className={styles.title}>
          {matchData.player1} vs {matchData.player2}
        </h1>
      </div>

      <div className={styles.content}>
        <div className={styles.boardSection}>
          <div className={styles.board}>将棋盤（実装予定）</div>
          <div className={styles.controls}>
            <button className={styles.controlButton}>⏮ 最初</button>
            <button className={styles.controlButton}>◀ 前へ</button>
            <button className={styles.controlButton}>▶ 次へ</button>
            <button className={styles.controlButton}>⏭ 最後</button>
          </div>
        </div>

        <div className={styles.infoSection}>
          <div className={styles.infoCard}>
            <h3 className={styles.infoTitle}>対局情報</h3>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>ステータス</span>
              <span className={styles.infoValue}>{matchData.status}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>開始日時</span>
              <span className={styles.infoValue}>
                {matchData.date} {matchData.time}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>手数</span>
              <span className={styles.infoValue}>{matchData.moves}手</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>手番</span>
              <span className={styles.infoValue}>{matchData.currentTurn}</span>
            </div>
          </div>

          <div className={styles.infoCard}>
            <h3 className={styles.infoTitle}>棋譜</h3>
            <div className={styles.moveList}>
              {moves.map((move, index) => (
                <div key={index} className={styles.move}>
                  {move}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
