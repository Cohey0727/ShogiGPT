import { useState, useCallback, useMemo } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons";
import type { Board } from "../../../shared/consts";
import { applyUsiMove } from "../../../shared/services";
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
  moves,
  open,
  onClose,
}: ShogiReplayModalProps) {
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);

  // 現在の局面を計算
  const currentBoard = useMemo(() => {
    let board = startBoard;
    for (let i = 0; i <= currentMoveIndex && i < moves.length; i++) {
      board = applyUsiMove(board, moves[i].move);
    }
    return board;
  }, [startBoard, moves, currentMoveIndex]);

  // 現在のコメントを取得
  const currentComment = useMemo(() => {
    if (currentMoveIndex >= moves.length) {
      return null;
    }
    return moves[currentMoveIndex]?.comment ?? null;
  }, [moves, currentMoveIndex]);

  const handlePrevMove = useCallback(() => {
    setCurrentMoveIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNextMove = useCallback(() => {
    setCurrentMoveIndex((prev) => Math.min(moves.length - 1, prev + 1));
  }, [moves.length]);

  const handleFirstMove = useCallback(() => {
    setCurrentMoveIndex(0);
  }, []);

  const handleLastMove = useCallback(() => {
    setCurrentMoveIndex(moves.length - 1);
  }, [moves.length]);

  // モーダルの開閉を処理
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (newOpen) {
        setCurrentMoveIndex(0);
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
          <Col gap="md" className={styles.inner}>
            <Row justify="space-between" align="center">
              <h2 className={styles.title}>{title}</h2>
              <DialogPrimitive.Close className={styles.close}>
                <span>×</span>
              </DialogPrimitive.Close>
            </Row>
            <ShogiTable board={currentBoard} onBoardChange={handleBoardChange} disabled />
            <Row justify="center" align="center" gap="sm">
              <button
                className={styles.controlButton}
                onClick={handleFirstMove}
                disabled={currentMoveIndex <= 0}
              >
                <DoubleArrowLeftIcon />
              </button>
              <button
                className={styles.controlButton}
                onClick={handlePrevMove}
                disabled={currentMoveIndex <= 0}
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
