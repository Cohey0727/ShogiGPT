import { pieceProperties, Player, type Piece, type Position } from "../shared/consts";

/**
 * 駒が成れる条件を満たしているか判定する
 *
 * @param piece 駒
 * @param from 移動元の位置
 * @param to 移動先の位置
 * @returns 成れる場合はtrue、そうでない場合はfalse
 */
export function canPromote(piece: Piece, from: Position, to: Position): boolean {
  // 成れる駒タイプかチェック
  const properties = pieceProperties[piece.type];
  if (!properties.promoted) {
    return false;
  }

  // 敵陣の範囲を定義
  const isInEnemyTerritory = (row: number, player: Player): boolean => {
    if (player === Player.Sente) {
      // 先手の場合、敵陣は0〜2行目
      return row <= 2;
    } else {
      // 後手の場合、敵陣は6〜8行目
      return row >= 6;
    }
  };

  // 移動元または移動先が敵陣の場合、成ることができる
  const fromInEnemyTerritory = isInEnemyTerritory(from.row, piece.player);
  const toInEnemyTerritory = isInEnemyTerritory(to.row, piece.player);

  return fromInEnemyTerritory || toInEnemyTerritory;
}
