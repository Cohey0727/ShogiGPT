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
  const [senteType, setSenteType] = useState<"HUMAN" | "AI">("HUMAN");
  const [goteType, setGoteType] = useState<"HUMAN" | "AI">("AI");

  const handleCreateMatch = async () => {
    setIsCreating(true);
    try {
      const newMatchId = createId();
      const result = await createMatch({
        id: newMatchId,
        playerSente: senteType === "HUMAN" ? "あなた" : "AI",
        playerGote: goteType === "HUMAN" ? "あなた" : "AI",
        senteType,
        goteType,
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
        <Button
          onClick={() => setShowConfirmDialog(true)}
          disabled={isCreating}
        >
          {isCreating ? "作成中..." : "新規対局"}
        </Button>
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
          <DialogDescription>プレイヤーを選択してください</DialogDescription>

          <div style={{ marginTop: "1.5rem", marginBottom: "1rem" }}>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                先手
              </label>
              <Row justify="center">
                <SegmentButton
                  options={[
                    { value: "HUMAN", label: "人間" },
                    { value: "AI", label: "AI" },
                  ]}
                  value={senteType}
                  onChange={setSenteType}
                  disabled={isCreating}
                />
              </Row>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                後手
              </label>
              <Row justify="center">
                <SegmentButton
                  options={[
                    { value: "HUMAN", label: "人間" },
                    { value: "AI", label: "AI" },
                  ]}
                  value={goteType}
                  onChange={setGoteType}
                  disabled={isCreating}
                />
              </Row>
            </div>
          </div>

          <Row gap="sm" justify="end">
            <Button
              variant="outlined"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isCreating}
            >
              キャンセル
            </Button>
            <Button
              variant="filled"
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
