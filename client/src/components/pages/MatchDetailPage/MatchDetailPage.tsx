import { useParams } from "wouter";
import { useState } from "react";
import { ShogiBoard, MatchChat, PieceStand } from "../../organisms";

import styles from "./MatchDetailPage.css";
import { createInitialBoard } from "../../../utils/shogi";
import type { PieceType as PieceTypeType, Board } from "../../../shared/consts";
import { Player } from "../../../shared/consts";

export function MatchDetailPage() {
  const params = useParams<{ matchId: string }>();
  const matchId = params.matchId;

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

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.chatSection}>
          <MatchChat matchId={matchId || "unknown"} />
        </div>

        <div className={styles.boardSection}>
          <div className={styles.gotePieceStand}>
            <PieceStand player="gote" capturedPieces={goteCaptured} />
          </div>
          <ShogiBoard
            board={board}
            currentPlayer={currentPlayer}
            onBoardChange={setBoard}
          />
          <div className={styles.sentePieceStand}>
            <PieceStand player="sente" capturedPieces={senteCaptured} />
          </div>
        </div>
      </div>
    </div>
  );
}
