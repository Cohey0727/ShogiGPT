import type { Board, Position, BoardIndex } from "../consts";

/**
 * 2つの盤面を比較して、変化があったセルの位置を返す
 */
export function calculateDiffCells(
  previousBoard: Board,
  currentBoard: Board
): Position[] {
  const diffCells: Position[] = [];

  // 9x9の盤面を比較
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const prevCell = previousBoard.cells[row][col];
      const currCell = currentBoard.cells[row][col];

      // セルの内容が異なる場合
      if (
        prevCell?.type !== currCell?.type ||
        prevCell?.player !== currCell?.player
      ) {
        diffCells.push({ row: row as BoardIndex, col: col as BoardIndex });
      }
    }
  }

  return diffCells;
}
