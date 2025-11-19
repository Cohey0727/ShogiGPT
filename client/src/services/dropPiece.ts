import { Player, PieceType, type Board, type Position } from "../shared/consts";

/**
 * 持ち駒を打てる位置を取得する
 *
 * @param board 盤面
 * @param pieceType 打とうとしている駒のタイプ
 * @param player プレイヤー
 * @returns 打てる位置の配列
 */
export function getDropPositions(
  board: Board,
  pieceType: PieceType,
  player: Player
): Position[] {
  const positions: Position[] = [];

  // 盤面全体をチェック
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      // 空いているマスのみ
      if (board.cells[row][col] === null) {
        // 二歩チェック（歩を打つ場合）
        if (pieceType === PieceType.Pawn) {
          if (!hasDoublesPawn(board, col, player)) {
            positions.push({ row: row as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8, col: col as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 });
          }
        } else {
          positions.push({ row: row as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8, col: col as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 });
        }
      }
    }
  }

  return positions;
}

/**
 * 指定した列に既に歩があるかチェック（二歩の禁則）
 *
 * @param board 盤面
 * @param col 列
 * @param player プレイヤー
 * @returns 既に歩がある場合はtrue
 */
function hasDoublesPawn(board: Board, col: number, player: Player): boolean {
  for (let row = 0; row < 9; row++) {
    const cell = board.cells[row][col];
    if (
      cell &&
      cell.player === player &&
      cell.type === PieceType.Pawn
    ) {
      return true;
    }
  }
  return false;
}
