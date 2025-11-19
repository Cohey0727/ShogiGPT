import { pieceProperties, Player, type PieceType } from "../../../shared/consts";
import * as styles from "./PromotionModal.css";

interface PromotionModalProps {
  /** 成る前の駒タイプ */
  pieceType: PieceType;
  /** プレイヤー */
  player: Player;
  /** 通常の駒を選択した時のコールバック */
  onSelectNormal: () => void;
  /** 成駒を選択した時のコールバック */
  onSelectPromoted: () => void;
}

export function PromotionModal({
  pieceType,
  player,
  onSelectNormal,
  onSelectPromoted,
}: PromotionModalProps) {
  const properties = pieceProperties[pieceType];
  const promotedType = properties.promoted;

  if (!promotedType) {
    return null;
  }

  const promotedProperties = pieceProperties[promotedType];

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.title}>成りますか？</div>
        <div className={styles.options}>
          <div className={styles.option} onClick={onSelectNormal}>
            <img
              src={properties.image}
              alt={properties.name}
              className={styles.pieceImage}
            />
            <div className={styles.pieceLabel}>成らない</div>
          </div>
          <div className={styles.option} onClick={onSelectPromoted}>
            <img
              src={promotedProperties.image}
              alt={promotedProperties.name}
              className={styles.pieceImage}
            />
            <div className={styles.pieceLabel}>成る</div>
          </div>
        </div>
      </div>
    </div>
  );
}
