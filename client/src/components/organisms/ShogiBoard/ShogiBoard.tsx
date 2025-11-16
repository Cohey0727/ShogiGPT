import { useCallback, useMemo, useState } from "react";
import clsx from "clsx";
import { Player, pieceProperties } from "../../../shared/consts";
import type { Board, BoardIndex, Position } from "../../../shared/consts";
import { getPossibleMoves } from "../../../services";
import styles from "./ShogiBoard.css";

interface ShogiBoardProps {
  board: Board;
  currentPlayer: Player;
  onBoardChange: (board: Board) => void;
}

export function ShogiBoard({ board, currentPlayer, onBoardChange }: ShogiBoardProps) {
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
          // 別のマスをクリック -> 駒を移動（合法手の場合のみ）
          const isPossibleMove = possibleMoves.some(
            (move) => move.row === row && move.col === col
          );

          if (isPossibleMove) {
            // 合法手の場合のみ移動を実行
            const newCells = board.cells.map((r) => r.slice());
            const piece = newCells[selectedPosition.row][selectedPosition.col];
            const capturedPiece = newCells[row][col];

            // 駒を移動
            newCells[selectedPosition.row][selectedPosition.col] = null;
            newCells[row][col] = piece;

            // 持ち駒の更新
            const newCapturedBySente = [...board.capturedBySente];
            const newCapturedByGote = [...board.capturedByGote];

            if (capturedPiece) {
              // 駒を取った場合、持ち駒に追加
              // 成り駒の場合は元の駒に戻す
              const capturedType =
                pieceProperties[capturedPiece.type].unpromoted ||
                capturedPiece.type;

              if (piece?.player === Player.Sente) {
                // 先手が取った
                newCapturedBySente.push(capturedType);
              } else {
                // 後手が取った
                newCapturedByGote.push(capturedType);
              }
            }

            onBoardChange({
              ...board,
              cells: newCells,
              capturedBySente: newCapturedBySente,
              capturedByGote: newCapturedByGote,
            });
          }

          // 合法手でもそうでなくても選択を解除
          setSelectedPosition(null);
        }
      } else {
        // 駒を掴んでいない状態
        const piece = board.cells[row][col];
        if (piece && piece.player === currentPlayer) {
          // 自分の駒があるマスをクリック -> 選択
          setSelectedPosition({ row, col });
        }
      }
    },
    [board, selectedPosition, possibleMoves, onBoardChange, currentPlayer]
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
              className={clsx(styles.cell, {
                [styles.selected]: isSelected,
                [styles.possibleMove]: isPossibleMove,
              })}
              onClick={() =>
                handleCellClick(rowIndex as BoardIndex, colIndex as BoardIndex)
              }
            >
              {cell && (
                <img
                  src={pieceProperties[cell.type].image}
                  alt={pieceProperties[cell.type].name}
                  className={clsx(styles.piece, {
                    [styles.gote]: cell.player === Player.Gote,
                  })}
                />
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
