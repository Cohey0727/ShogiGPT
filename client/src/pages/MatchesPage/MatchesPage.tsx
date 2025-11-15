import { Link } from "wouter";
import styles from "./MatchesPage.css";

// ダミーデータ
const matches = [
  {
    id: "match-001",
    player1: "田中太郎",
    player2: "佐藤花子",
    status: "進行中",
    date: "2025-01-15",
    moves: 42,
  },
  {
    id: "match-002",
    player1: "鈴木一郎",
    player2: "山田次郎",
    status: "完了",
    date: "2025-01-14",
    moves: 87,
  },
  {
    id: "match-003",
    player1: "高橋三郎",
    player2: "渡辺四郎",
    status: "進行中",
    date: "2025-01-15",
    moves: 15,
  },
];

export function MatchesPage() {
  return (
    <div className={styles.container}>
      <Link href="/">
        <button className={styles.backButton}>← ホームに戻る</button>
      </Link>

      <div className={styles.header}>
        <h1 className={styles.title}>対局一覧</h1>
        <p className={styles.subtitle}>進行中の対局と過去の対局を確認できます</p>
      </div>

      <div className={styles.matchList}>
        {matches.map((match) => (
          <Link key={match.id} href={`/matches/${match.id}`}>
            <div className={styles.matchCard}>
              <div className={styles.matchHeader}>
                <span className={styles.matchId}>#{match.id}</span>
                <span className={styles.matchStatus}>{match.status}</span>
              </div>

              <div className={styles.matchPlayers}>
                <div className={styles.player}>
                  <span className={styles.playerName}>{match.player1}</span>
                </div>
                <span className={styles.vs}>VS</span>
                <div className={styles.player}>
                  <span className={styles.playerName}>{match.player2}</span>
                </div>
              </div>

              <div className={styles.matchInfo}>
                <span>📅 {match.date}</span>
                <span>🎯 {match.moves}手</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
