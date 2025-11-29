import { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { Player, pieces, Board, BoardIndex, Position, PieceType } from "../../../shared/consts";
import { getPossibleMoves, canPromote, getDropPositions } from "../../../services";
import { moveToUsi, dropToUsi } from "../../../shared/services";
import { useModal } from "../../molecules/hooks";
import { PromotionModal } from "../../molecules";
import styles from "./ShogiBoard.css";

interface ShogiBoardProps {
  board: Board;
  currentPlayer: Player;
  onBoardChange: (board: Board, usiMove: string) => void;
  selectedHandPiece?: PieceType | null;
  onHandPieceDeselect?: () => void;
  disabled?: boolean;
  diffCells?: Position[];
}

export function ShogiBoard({
  board,
  currentPlayer,
  onBoardChange,
  selectedHandPiece,
  onHandPieceDeselect,
  disabled = false,
  diffCells = [],
}: ShogiBoardProps) {
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [isPromotionModalOpen, promotionModalController] = useModal<boolean>();
  const [promotionState, setPromotionState] = useState<{
    pieceType: PieceType;
    player: Player;
  } | null>(null);

  // ESCキーで駒の選択を解除
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (selectedPosition) {
          setSelectedPosition(null);
        }
        if (selectedHandPiece && onHandPieceDeselect) {
          onHandPieceDeselect();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedPosition, selectedHandPiece, onHandPieceDeselect]);

  // 移動可能なマスを計算（盤上の駒を選択している場合）
  const possibleMoves = useMemo(() => {
    if (selectedHandPiece) {
      // 持ち駒を選択している場合は、打てる位置を返す
      return getDropPositions(board, selectedHandPiece, currentPlayer);
    }
    if (!selectedPosition) return [];
    return getPossibleMoves(board, selectedPosition);
  }, [board, selectedPosition, selectedHandPiece, currentPlayer]);

  const handleCellClick = useCallback(
    async (row: BoardIndex, col: BoardIndex) => {
      // 局面が無効化されている場合は何もしない
      if (disabled) return;

      // 持ち駒を選択している場合
      if (selectedHandPiece) {
        const isPossibleDrop = possibleMoves.some((move) => move.row === row && move.col === col);

        if (isPossibleDrop) {
          // 持ち駒を打つ
          const newCells = board.cells.map((r) => r.slice());
          newCells[row][col] = {
            type: selectedHandPiece,
            player: currentPlayer,
          };

          // 持ち駒から削除
          const newCapturedBySente = [...board.senteHands];
          const newCapturedByGote = [...board.goteHands];

          if (currentPlayer === Player.Sente) {
            const index = newCapturedBySente.indexOf(selectedHandPiece);
            if (index > -1) {
              newCapturedBySente.splice(index, 1);
            }
          } else {
            const index = newCapturedByGote.indexOf(selectedHandPiece);
            if (index > -1) {
              newCapturedByGote.splice(index, 1);
            }
          }

          // USI形式の指し手を生成（駒打ち）
          const usiMove = dropToUsi(selectedHandPiece, { row, col });

          onBoardChange(
            {
              ...board,
              cells: newCells,
              senteHands: newCapturedBySente,
              goteHands: newCapturedByGote,
            },
            usiMove,
          );

          // 持ち駒の選択を解除
          if (onHandPieceDeselect) {
            onHandPieceDeselect();
          }
        } else {
          // 打てない位置をクリック -> 持ち駒の選択を解除
          if (onHandPieceDeselect) {
            onHandPieceDeselect();
          }
        }
        return;
      }

      if (selectedPosition) {
        // 駒を掴んでいる状態
        if (selectedPosition.row === row && selectedPosition.col === col) {
          // 同じマスをクリック -> 選択解除
          setSelectedPosition(null);
        } else {
          // 別のマスをクリック -> 駒を移動（合法手の場合のみ）
          const isPossibleMove = possibleMoves.some((move) => move.row === row && move.col === col);

          if (isPossibleMove) {
            // 合法手の場合のみ移動を実行
            const newCells = board.cells.map((r) => r.slice());
            const piece = newCells[selectedPosition.row][selectedPosition.col];
            const handsPiece = newCells[row][col];

            if (!piece) return;

            // 成れるかチェック
            const shouldPromote = canPromote(piece, selectedPosition, {
              row,
              col,
            });

            let finalPiece = piece;

            // 成れる場合はモーダルを表示
            if (shouldPromote) {
              setPromotionState({
                pieceType: piece.type,
                player: piece.player,
              });

              const promote = await promotionModalController.open();

              if (promote) {
                // 成る
                const promotedType = pieces[piece.type].promoted;
                if (promotedType) {
                  finalPiece = { ...piece, type: promotedType };
                }
              }

              setPromotionState(null);
            }

            // 駒を移動
            newCells[selectedPosition.row][selectedPosition.col] = null;
            newCells[row][col] = finalPiece;

            // 持ち駒の更新
            const newSenteHands = [...board.senteHands];
            const newGoteHands = [...board.goteHands];

            if (handsPiece) {
              // 駒を取った場合、持ち駒に追加
              // 成り駒の場合は元の駒に戻す
              const capturedType = pieces[handsPiece.type].unpromoted || handsPiece.type;

              if (piece.player === Player.Sente) {
                // 先手が取った
                newSenteHands.push(capturedType);
              } else {
                // 後手が取った
                newGoteHands.push(capturedType);
              }
            }

            // USI形式の指し手を生成（駒の移動）
            const promoted = finalPiece.type !== piece.type;
            const usiMove = moveToUsi(selectedPosition, { row, col }, promoted);

            onBoardChange(
              {
                ...board,
                cells: newCells,
                senteHands: newSenteHands,
                goteHands: newGoteHands,
              },
              usiMove,
            );
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
          // 盤上の駒を選択したら、持ち駒の選択を解除
          if (selectedHandPiece && onHandPieceDeselect) {
            onHandPieceDeselect();
          }
        }
      }
    },
    [
      board,
      selectedPosition,
      possibleMoves,
      onBoardChange,
      currentPlayer,
      promotionModalController,
      selectedHandPiece,
      onHandPieceDeselect,
      disabled,
    ],
  );

  return (
    <>
      <div className={clsx(styles.board, { [styles.disabled]: disabled })}>
        {board.cells.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isSelected =
              selectedPosition?.row === rowIndex && selectedPosition?.col === colIndex;

            const isPossibleMove = possibleMoves.some(
              (move) => move.row === rowIndex && move.col === colIndex,
            );

            const isDiff = diffCells.some((diff) => diff.row === rowIndex && diff.col === colIndex);

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={clsx(styles.cell, {
                  [styles.selected]: isSelected,
                  [styles.possibleMove]: isPossibleMove,
                  [styles.diff]: isDiff,
                })}
                onClick={() => handleCellClick(rowIndex as BoardIndex, colIndex as BoardIndex)}
              >
                {cell && (
                  <img
                    src={pieces[cell.type].image}
                    alt={pieces[cell.type].name}
                    className={clsx(styles.piece, {
                      [styles.gote]: cell.player === Player.Gote,
                    })}
                  />
                )}
              </div>
            );
          }),
        )}
      </div>
      {isPromotionModalOpen && promotionState && (
        <PromotionModal
          pieceType={promotionState.pieceType}
          onSelectNormal={() => promotionModalController.close(false)}
          onSelectPromoted={() => promotionModalController.close(true)}
        />
      )}
    </>
  );
}
