import { Link } from "wouter";
import { useState } from "react";
import { useGetMatchesQuery } from "../../../generated/graphql/types";
import type { Scalars } from "../../../generated/graphql/types";
import { Button } from "../../atoms";
import { StartMatchDialog } from "../../organisms";
import styles from "./MatchesPage.css";

const statusLabels: Record<Scalars["MatchStatus"]["input"], string> = {
  ONGOING: "進行中",
  COMPLETED: "完了",
  ABANDONED: "中断",
};

const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString("ja-JP");
};

export function MatchesPage() {
  const [{ data, error }] = useGetMatchesQuery();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>対局一覧</h1>
        </div>
        <p>エラー: {error.message}</p>
      </div>
    );
  }

  const matches = data?.matches || [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>対局一覧</h1>
        <p className={styles.subtitle}>進行中の対局と過去の対局を確認できます</p>
        <Button onClick={() => setShowConfirmDialog(true)}>新規対局</Button>
      </div>

      <div className={styles.matchList}>
        {matches.length === 0 ? (
          <p>対局がありません</p>
        ) : (
          matches.map((match) => (
            <Link key={match.id} href={`/matches/${match.id}`}>
              <div className={styles.matchCard}>
                <div className={styles.matchHeader}>
                  <span className={styles.matchId}>#{match.id}</span>
                  <span className={styles.matchStatus}>{statusLabels[match.status]}</span>
                </div>

                <div className={styles.matchPlayers}>
                  <div className={styles.player}>
                    <span className={styles.playerName}>{match.playerSente || "先手"}</span>
                  </div>
                  <span className={styles.vs}>VS</span>
                  <div className={styles.player}>
                    <span className={styles.playerName}>{match.playerGote || "後手"}</span>
                  </div>
                </div>

                <div className={styles.matchInfo}>
                  <span>{formatDate(match.createdAt)}</span>
                  <span>{match.matchStates.length}手</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <StartMatchDialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)} />
    </div>
  );
}
