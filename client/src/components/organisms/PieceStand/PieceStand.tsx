import { Player, pieceProperties } from "../../../shared/consts";
import type { PieceType } from "../../../shared/consts";
import styles from "./PieceStand.css";

interface PieceStandProps {
  player: Player;
  capturedPieces: { [key in PieceType]?: number };
}

export function PieceStand({ player, capturedPieces }: PieceStandProps) {
  const isGote = player === Player.Gote;

  return (
    <div
      className={`${styles.captured} ${
        isGote ? styles.capturedGote : styles.capturedSente
      }`}
    >
      <div className={styles.capturedList}>
        {Object.entries(capturedPieces).map(([pieceType, count]) => {
          if (!count || count === 0) return null;

          const type = pieceType as PieceType;
          const piece = pieceProperties[type];

          return (
            <div key={pieceType} className={styles.capturedPieceItem}>
              <img
                src={piece.image}
                alt={piece.name}
                className={`${styles.capturedPieceImage} ${
                  isGote ? styles.gote : ""
                }`}
              />
              {count > 1 && (
                <span className={styles.capturedPieceCount}>{count}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
