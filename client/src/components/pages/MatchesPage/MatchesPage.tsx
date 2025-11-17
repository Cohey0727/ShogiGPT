import { Link, useLocation } from "wouter";
import { useState } from "react";
import { createId } from "@paralleldrive/cuid2";
import { useGetMatchesQuery, useCreateMatchMutation } from "../../../generated/graphql/types";
import type { Scalars } from "../../../generated/graphql/types";
import { Dialog, DialogContent, DialogTitle, DialogDescription, Button, Row, SegmentButton } from "../../atoms";
import styles from "./MatchesPage.css";

const getStatusLabel = (status: Scalars["MatchStatus"]["input"]): string => {
  switch (status) {
    case "ONGOING":
      return "進行中";
    case "COMPLETED":
      return "完了";
    case "ABANDONED":
      return "中断";
    default:
      return "不明";
  }
};

const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString("ja-JP");
};

export function MatchesPage() {
  const [{ data, fetching, error }] = useGetMatchesQuery();
  const [, setLocation] = useLocation();
  const [, createMatch] = useCreateMatchMutation();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedSide, setSelectedSide] = useState<"sente" | "gote">("sente");

  const handleCreateMatch = async () => {
    setIsCreating(true);
    try {
      const newMatchId = createId();
      const result = await createMatch({
        id: newMatchId,
        playerSente: selectedSide === "sente" ? "あなた" : "AI",
        playerGote: selectedSide === "gote" ? "あなた" : "AI",
      });

      if (result.data?.createMatch) {
        setLocation(`/matches/${result.data.createMatch.id}`);
      } else if (result.error) {
        alert(`対局の作成に失敗しました: ${result.error.message}`);
      }
    } catch (error) {
      alert(`対局の作成に失敗しました: ${error}`);
    } finally {
      setIsCreating(false);
      setShowConfirmDialog(false);
    }
  };

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

  const matches = data?.matches || [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>対局一覧</h1>
        <p className={styles.subtitle}>
          進行中の対局と過去の対局を確認できます
        </p>
        <button
          className={styles.newMatchButton}
          onClick={() => setShowConfirmDialog(true)}
          disabled={isCreating}
        >
          {isCreating ? "作成中..." : "新規対局"}
        </button>
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
                  <span>{match.matchStates.length}手</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogTitle>新規対局を開始</DialogTitle>
          <DialogDescription>あなたの手番を選択してください</DialogDescription>
          <Row justify="center" style={{ marginTop: "1rem", marginBottom: "1rem" }}>
            <SegmentButton
              options={[
                { value: "sente", label: "先手" },
                { value: "gote", label: "後手" },
              ]}
              value={selectedSide}
              onChange={setSelectedSide}
              disabled={isCreating}
            />
          </Row>
          <Row gap="sm" justify="end">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isCreating}
            >
              キャンセル
            </Button>
            <Button
              variant="default"
              onClick={handleCreateMatch}
              disabled={isCreating}
            >
              {isCreating ? "作成中..." : "開始"}
            </Button>
          </Row>
        </DialogContent>
      </Dialog>
    </div>
  );
}
