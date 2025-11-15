import { useCallback, useMemo, useState } from "react";
import { Player, pieceProperties } from "../../../shared/consts";
import type { Board, BoardIndex, Position } from "../../../shared/consts";
import { getPossibleMoves } from "../../../services";
import styles from "./ShogiBoard.css";

interface ShogiBoardProps {
  board: Board;
}

export function ShogiBoard({ board: initialBoard }: ShogiBoardProps) {
  const [board, setBoard] = useState(initialBoard);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(
    null
  );

  // 移動可能なマスを計算
  const possibleMoves = useMemo(() => {
    if (!selectedPosition) return [];
    return getPossibleMoves(board, selectedPosition);
  }, [board, selectedPosition]);

  const handleCellClick = useCallback(
    (row: BoardIndex, col: BoardIndex) => {
      if (selectedPosition) {
        // 駒を掴んでいる状態
        if (selectedPosition.row === row && selectedPosition.col === col) {
          // 同じマスをクリック -> 選択解除
          setSelectedPosition(null);
        } else {
          // 別のマスをクリック -> 駒を移動
          const newCells = board.cells.map((r) => r.slice());
          const piece = newCells[selectedPosition.row][selectedPosition.col];
          newCells[selectedPosition.row][selectedPosition.col] = null;
          newCells[row][col] = piece;

          setBoard({
            ...board,
            cells: newCells,
          });
          setSelectedPosition(null);
        }
      } else {
        // 駒を掴んでいない状態
        if (board.cells[row][col]) {
          // 駒があるマスをクリック -> 選択
          setSelectedPosition({ row, col });
        }
      }
    },
    [board, selectedPosition]
  );

  return (
    <div className={styles.board}>
      {board.cells.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const isSelected =
            selectedPosition?.row === rowIndex &&
            selectedPosition?.col === colIndex;

          const isPossibleMove = possibleMoves.some(
            (move) => move.row === rowIndex && move.col === colIndex
          );

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`${styles.cell} ${isSelected ? styles.selected : ""} ${
                isPossibleMove ? styles.possibleMove : ""
              }`}
              onClick={() =>
                handleCellClick(rowIndex as BoardIndex, colIndex as BoardIndex)
              }
            >
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
          );
        })
      )}
    </div>
  );
}
