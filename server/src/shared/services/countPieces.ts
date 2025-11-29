import type { Board, Player } from "../consts/shogi";

/**
 * 局面上の特定プレイヤーの駒の数をカウント
 */
export function countPieces(board: Board, player: Player): number {
  let count = 0;
  for (const row of board.cells) {
    for (const cell of row) {
      if (cell && cell.player === player) {
        count++;
      }
    }
  }
  return count;
}
