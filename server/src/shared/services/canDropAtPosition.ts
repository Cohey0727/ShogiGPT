import { Player, PieceType } from "../consts";

/**
 * 指定した位置に駒を打てるかチェック（最前線への配置禁止）
 *
 * @param pieceType 駒のタイプ
 * @param row 行
 * @param player プレイヤー
 * @returns 打てる場合はtrue
 */
export function canDropAtPosition(pieceType: PieceType, row: number, player: Player): boolean {
  // 先手の場合（上から下へ進む）
  if (player === Player.Sente) {
    // 歩と香車は1段目（row=0）に打てない
    if (pieceType === PieceType.Pawn || pieceType === PieceType.Lance) {
      if (row === 0) {
        return false;
      }
    }
    // 桂馬は1段目と2段目（row=0,1）に打てない
    if (pieceType === PieceType.Knight) {
      if (row <= 1) {
        return false;
      }
    }
  } else {
    // 後手の場合（下から上へ進む）
    // 歩と香車は9段目（row=8）に打てない
    if (pieceType === PieceType.Pawn || pieceType === PieceType.Lance) {
      if (row === 8) {
        return false;
      }
    }
    // 桂馬は9段目と8段目（row=8,7）に打てない
    if (pieceType === PieceType.Knight) {
      if (row >= 7) {
        return false;
      }
    }
  }

  return true;
}
