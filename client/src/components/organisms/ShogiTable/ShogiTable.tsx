import { useState, useCallback } from "react";
import type { Board, PieceType, Position } from "../../../shared/consts";
import { Row } from "../../atoms";
import { PieceStand } from "./PieceStand";
import { ShogiBoard } from "./ShogiBoard";
import styles from "./ShogiTable.css";

export interface ShogiTableProps {
  /** 現在の盤面状態 */
  board: Board;
  /** 盤面が変更された時のコールバック */
  onBoardChange: (board: Board, usiMove: string) => void;
  /** 盤面操作を無効化するかどうか */
  disabled?: boolean;
  /** 前の局面との差分セル */
  diffCells?: Position[];
}

/**
 * 将棋盤と駒台を含むコンポーネント
 */
export function ShogiTable({
  board,
  onBoardChange,
  disabled = false,
  diffCells = [],
}: ShogiTableProps) {
  const [selectedHandPiece, setSelectedHandPiece] = useState<PieceType | null>(null);

  const handleGotePieceSelect = useCallback(
    (pieceType: PieceType) => {
      if (board.turn === "GOTE") {
        setSelectedHandPiece(pieceType);
      }
    },
    [board.turn],
  );

  const handleSentePieceSelect = useCallback(
    (pieceType: PieceType) => {
      if (board.turn === "SENTE") {
        setSelectedHandPiece(pieceType);
      }
    },
    [board.turn],
  );

  const handleHandPieceDeselect = useCallback(() => {
    setSelectedHandPiece(null);
  }, []);

  return (
    <Row className={styles.container} align="center" justify="center">
      <div className={styles.gotePieceStand}>
        <PieceStand
          player="GOTE"
          pieces={board.goteHands}
          selectedPieceType={board.turn === "GOTE" ? selectedHandPiece : null}
          onPieceSelect={handleGotePieceSelect}
          disabled={disabled}
        />
      </div>
      <div className={styles.boardContainer}>
        <ShogiBoard
          board={board}
          currentPlayer={board.turn}
          onBoardChange={onBoardChange}
          selectedHandPiece={selectedHandPiece}
          onHandPieceDeselect={handleHandPieceDeselect}
          disabled={disabled}
          diffCells={diffCells}
        />
      </div>
      <div className={styles.sentePieceStand}>
        <PieceStand
          player="SENTE"
          pieces={board.senteHands}
          selectedPieceType={board.turn === "SENTE" ? selectedHandPiece : null}
          onPieceSelect={handleSentePieceSelect}
          disabled={disabled}
        />
      </div>
    </Row>
  );
}
