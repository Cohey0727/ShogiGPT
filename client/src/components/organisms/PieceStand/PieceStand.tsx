import clsx from "clsx";
import { Player, pieceProperties, PieceType } from "../../../shared/consts";
import styles from "./PieceStand.css";

interface PieceStandProps {
  player: Player;
  pieces: PieceType[];
  selectedPieceType?: PieceType | null;
  onPieceSelect?: (pieceType: PieceType) => void;
}

// 持ち駒として表示する駒の種類（価値の高い順）
const PIECE_ORDER: PieceType[] = [
  PieceType.Rook,
  PieceType.Bishop,
  PieceType.Gold,
  PieceType.Silver,
  PieceType.Knight,
  PieceType.Lance,
  PieceType.Pawn,
];

export function PieceStand({
  player,
  pieces,
  selectedPieceType,
  onPieceSelect
}: PieceStandProps) {
  const isGote = player === Player.Gote;

  // PieceType[] から { [key in PieceType]?: number } への変換
  const pieceCounts = pieces.reduce((acc, piece) => {
    acc[piece] = (acc[piece] || 0) + 1;
    return acc;
  }, {} as { [key in PieceType]?: number });

  return (
    <div
      className={clsx(styles.captured, {
        [styles.capturedGote]: isGote,
        [styles.capturedSente]: !isGote,
      })}
    >
      <div className={styles.capturedList}>
        {PIECE_ORDER.map((pieceType) => {
          const count = pieceCounts[pieceType] || 0;
          const piece = pieceProperties[pieceType];
          const captured = count > 0;
          const isSelected = selectedPieceType === pieceType;

          return (
            <div
              key={pieceType}
              className={clsx(styles.itemContainer, {
                [styles.itemContainerBg]: captured,
                [styles.itemContainerSelected]: isSelected,
              })}
              onClick={() => {
                if (captured && onPieceSelect) {
                  onPieceSelect(pieceType);
                }
              }}
            >
              {captured ? (
                <>
                  <img
                    src={piece.image}
                    alt={piece.name}
                    className={clsx(styles.capturedPieceImage, {
                      [styles.gote]: isGote,
                    })}
                  />
                  {count > 1 && (
                    <span className={styles.capturedPieceCount}>{count}</span>
                  )}
                </>
              ) : (
                // 空のスペースを確保
                <div className={styles.capturedPieceImage} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
