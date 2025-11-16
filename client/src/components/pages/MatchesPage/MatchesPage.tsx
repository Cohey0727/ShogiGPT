import { Link } from "wouter";
import {
  useGetMatchesQuery,
  MatchStatus,
} from "../../../generated/graphql/types";
import styles from "./MatchesPage.css";

const getStatusLabel = (status: MatchStatus): string => {
  switch (status) {
    case MatchStatus.Ongoing:
      return "進行中";
    case MatchStatus.Completed:
      return "完了";
    case MatchStatus.Abandoned:
      return "中断";
  }
};

const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString("ja-JP");
};

export function MatchesPage() {
  const [result] = useGetMatchesQuery();

  const { data, fetching, error } = result;

  if (fetching) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>対局一覧</h1>
        </div>
        <p>読み込み中...</p>
      </div>
    );
  }

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

  const matches = data?.getMatches || [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>対局一覧</h1>
        <p className={styles.subtitle}>
          進行中の対局と過去の対局を確認できます
        </p>
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
                  <span className={styles.matchStatus}>
                    {getStatusLabel(match.status)}
                  </span>
                </div>

                <div className={styles.matchPlayers}>
                  <div className={styles.player}>
                    <span className={styles.playerName}>
                      {match.playerSente || "先手"}
                    </span>
                  </div>
                  <span className={styles.vs}>VS</span>
                  <div className={styles.player}>
                    <span className={styles.playerName}>
                      {match.playerGote || "後手"}
                    </span>
                  </div>
                </div>

                <div className={styles.matchInfo}>
                  <span>{formatDate(match.createdAt)}</span>
                  <span>{match.states.length}手</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
