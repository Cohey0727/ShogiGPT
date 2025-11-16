import { useParams, useLocation } from "wouter";
import { useState } from "react";
import { ShogiBoard, MatchChat, PieceStand } from "../../organisms";
import { useCreateMatchMutation } from "../../../generated/graphql/types";
import styles from "./MatchDetailPage.css";
import { createInitialBoard } from "../../../utils/shogi";
import type { PieceType as PieceTypeType, Board } from "../../../shared/consts";
import { Player } from "../../../shared/consts";

export function MatchDetailPage() {
  const params = useParams<{ matchId: string }>();
  const matchId = params.matchId;
  const [, setLocation] = useLocation();
  const [actualMatchId, setActualMatchId] = useState<string | null>(
    matchId === "new" ? null : matchId || null
  );
  const [, createMatch] = useCreateMatchMutation();

  // 盤面の状態管理（初期盤面、持ち駒は空）
  const [board, setBoard] = useState<Board>(createInitialBoard());
  // 現在のプレイヤー（先手から開始）
  const [currentPlayer, setCurrentPlayer] = useState<Player>(Player.Sente);

  // PieceType[] から { [key in PieceType]?: number } への変換
  const convertCapturedPieces = (
    pieces: PieceTypeType[]
  ): { [key in PieceTypeType]?: number } => {
    const result: { [key in PieceTypeType]?: number } = {};
    for (const piece of pieces) {
      result[piece] = (result[piece] || 0) + 1;
    }
    return result;
  };

  const senteCaptured = convertCapturedPieces(board.capturedBySente);
  const goteCaptured = convertCapturedPieces(board.capturedByGote);

  // 盤面変更時にプレイヤーを交代
  const handleBoardChange = (newBoard: Board) => {
    setBoard(newBoard);
    setCurrentPlayer(
      currentPlayer === Player.Sente ? Player.Gote : Player.Sente
    );
  };

  // 最初のメッセージ送信時にマッチを作成（matchIdが"new"の場合）
  const handleFirstMessage = async () => {
    if (actualMatchId) return actualMatchId; // すでにマッチが作成されている場合

    const result = await createMatch({
      input: {
        playerSente: "先手",
        playerGote: "後手",
      },
    });

    if (result.data?.createMatch) {
      const newMatchId = result.data.createMatch.id;
      setActualMatchId(newMatchId);
      // URLを置き換え
      setLocation(`/matches/${newMatchId}`, { replace: true });
      return newMatchId;
    }

    return null;
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.chatSection}>
          <MatchChat
            matchId={actualMatchId || "new"}
            onFirstMessage={matchId === "new" ? handleFirstMessage : undefined}
          />
        </div>

        <div className={styles.boardSection}>
          <div className={styles.gotePieceStand}>
            <PieceStand player="gote" capturedPieces={goteCaptured} />
          </div>
          <ShogiBoard
            board={board}
            currentPlayer={currentPlayer}
            onBoardChange={handleBoardChange}
          />
          <div className={styles.sentePieceStand}>
            <PieceStand player="sente" capturedPieces={senteCaptured} />
          </div>
        </div>
      </div>
    </div>
  );
}
