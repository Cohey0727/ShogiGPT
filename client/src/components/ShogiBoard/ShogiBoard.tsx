import { Player, pieceProperties } from "../../shared/consts";
import type { Board } from "../../shared/consts";
import styles from "./ShogiBoard.css";

interface ShogiBoardProps {
  board: Board;
}

export function ShogiBoard({ board }: ShogiBoardProps) {
  return (
    <div className={styles.container}>
      <div className={styles.board}>
        {board.cells.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div key={`${rowIndex}-${colIndex}`} className={styles.cell}>
              {cell && (
                <img
                  src={pieceProperties[cell.type].image}
                  alt={pieceProperties[cell.type].name}
                  className={`${styles.piece} ${
                    cell.player === Player.Gote ? styles.gote : ""
                  }`}
                />
              )}
            </div>
          ))
        )}
      </div>

      <div className={styles.info}>
        <div className={styles.captured}>
          <div className={styles.capturedTitle}>先手の持ち駒</div>
          <div className={styles.capturedList}>
            {board.capturedBySente.length === 0 ? (
              <span style={{ color: "#666" }}>なし</span>
            ) : (
              board.capturedBySente.map((piece, index) => (
                <span key={index} className={styles.capturedPiece}>
                  {pieceProperties[piece].name}
                </span>
              ))
            )}
          </div>
        </div>

        <div className={styles.captured}>
          <div className={styles.capturedTitle}>後手の持ち駒</div>
          <div className={styles.capturedList}>
            {board.capturedByGote.length === 0 ? (
              <span style={{ color: "#666" }}>なし</span>
            ) : (
              board.capturedByGote.map((piece, index) => (
                <span key={index} className={styles.capturedPiece}>
                  {pieceProperties[piece].name}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      <div className={styles.turn}>
        手番: {board.turn === Player.Sente ? "先手" : "後手"}
      </div>
    </div>
  );
}
