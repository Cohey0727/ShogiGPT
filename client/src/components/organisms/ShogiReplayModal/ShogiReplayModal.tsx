import { useState, useCallback, useMemo } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons";
import type { Board } from "../../../shared/consts";
import { applyUsiMove, calculateDiffCells } from "../../../shared/services";
import { Row, Col } from "../../atoms";
import { ShogiTable } from "../ShogiTable";
import styles from "./ShogiReplayModal.css";

/**
 * 再生する手の情報
 */
export interface ReplayMove {
  /** USI形式の指し手 */
  move: string;
  /** この手に対するコメント */
  comment: string;
}

export interface ShogiReplayModalProps {
  /** モーダルのタイトル */
  title: string;
  /** 開始局面 */
  startBoard: Board;
  /** 開始局面のコメント */
  startComment?: string;
  /** 再生する手順 */
  moves: ReplayMove[];
  /** モーダルの開閉状態 */
  open: boolean;
  /** モーダルを閉じるときのコールバック */
  onClose: () => void;
}

/**
 * 将棋の局面を再生するモーダル
 */
export function ShogiReplayModal({
  title,
  startBoard,
  startComment,
  moves,
  open,
  onClose,
}: ShogiReplayModalProps) {
  // -1は初期盤面、0以上は手番インデックス
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);

  // 現在の局面と前の局面を計算
  const { currentBoard, previousBoard } = useMemo(() => {
    let board = startBoard;
    let prevBoard = startBoard;
    for (let i = 0; i <= currentMoveIndex && i < moves.length; i++) {
      prevBoard = board;
      board = applyUsiMove(board, moves[i].move);
    }
    return { currentBoard: board, previousBoard: prevBoard };
  }, [startBoard, moves, currentMoveIndex]);

  // 前の局面との差分を計算
  const diffCells = useMemo(() => {
    return calculateDiffCells(previousBoard, currentBoard);
  }, [previousBoard, currentBoard]);

  // 現在のコメントを取得
  const currentComment = useMemo(() => {
    if (currentMoveIndex < 0) {
      return startComment ?? null;
    }
    if (currentMoveIndex >= moves.length) {
      return null;
    }
    return moves[currentMoveIndex]?.comment ?? null;
  }, [moves, currentMoveIndex, startComment]);

  const handlePrevMove = useCallback(() => {
    setCurrentMoveIndex((prev) => Math.max(-1, prev - 1));
  }, []);

  const handleNextMove = useCallback(() => {
    setCurrentMoveIndex((prev) => Math.min(moves.length - 1, prev + 1));
  }, [moves.length]);

  const handleFirstMove = useCallback(() => {
    setCurrentMoveIndex(-1);
  }, []);

  const handleLastMove = useCallback(() => {
    setCurrentMoveIndex(moves.length - 1);
  }, [moves.length]);

  // モーダルの開閉を処理
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (newOpen) {
        setCurrentMoveIndex(-1);
      } else {
        onClose();
      }
    },
    [onClose],
  );

  // ダミーのonBoardChange（再生専用なので操作不可）
  const handleBoardChange = useCallback(() => {}, []);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={styles.overlay} />
        <DialogPrimitive.Content className={styles.content}>
          <Col gap="md">
            <Row justify="space-between" align="center">
              <h2 className={styles.title}>{title}</h2>
              <DialogPrimitive.Close className={styles.close}>
                <span>×</span>
              </DialogPrimitive.Close>
            </Row>
            <ShogiTable
              board={currentBoard}
              onBoardChange={handleBoardChange}
              disabled
              diffCells={diffCells}
            />
            <Row justify="center" align="center" gap="sm">
              <button
                className={styles.controlButton}
                onClick={handleFirstMove}
                disabled={currentMoveIndex <= -1}
              >
                <DoubleArrowLeftIcon />
              </button>
              <button
                className={styles.controlButton}
                onClick={handlePrevMove}
                disabled={currentMoveIndex <= -1}
              >
                <ChevronLeftIcon />
              </button>
              <span className={styles.moveCounter}>
                {currentMoveIndex + 1} / {moves.length}
              </span>
              <button
                className={styles.controlButton}
                onClick={handleNextMove}
                disabled={currentMoveIndex >= moves.length - 1}
              >
                <ChevronRightIcon />
              </button>
              <button
                className={styles.controlButton}
                onClick={handleLastMove}
                disabled={currentMoveIndex >= moves.length - 1}
              >
                <DoubleArrowRightIcon />
              </button>
            </Row>

            {currentComment && (
              <Col gap="xs" className={styles.commentSection}>
                <div className={styles.commentLabel}>コメント</div>
                <div className={styles.commentText}>{currentComment}</div>
              </Col>
            )}
          </Col>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
