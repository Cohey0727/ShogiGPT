import type { Position, BoardPiece, Player } from "../shared/consts/shogi";
import { pieces } from "../shared/consts/shogi";
import type { BoardDiff } from "./boardDiff";

/**
 * 移動の種類
 */
export const MoveType = {
  /** 通常の移動 */
  Move: "move",
  /** 駒打ち */
  Drop: "drop",
} as const;

export type MoveType = (typeof MoveType)[keyof typeof MoveType];

/**
 * 指し手情報
 */
export interface Move {
  /** 移動の種類 */
  type: MoveType;
  /** 移動元の位置（駒打ちの場合はundefined） */
  from?: Position;
  /** 移動先の位置 */
  to: Position;
  /** 移動した駒 */
  piece: BoardPiece;
  /** 取った駒（なければundefined） */
  captured?: BoardPiece;
  /** 成ったかどうか */
  promoted: boolean;
}

/**
 * BoardDiffから指し手情報を算出する
 *
 * @param diff - ボードの差分情報
 * @param currentPlayer - 現在の手番のプレイヤー（移動前の手番）
 * @returns 指し手情報、または解析できない場合はnull
 */
export function analyzeMove(diff: BoardDiff, currentPlayer: Player): Move | null {
  const { cellDiffs, capturedDiff } = diff;

  // cellDiffsが0または3つ以上の場合は不正
  if (cellDiffs.length === 0 || cellDiffs.length > 2) {
    return null;
  }

  // cellDiffsが1つの場合は駒打ち
  if (cellDiffs.length === 1) {
    const diff = cellDiffs[0];

    // 駒打ちは before が null で after が駒
    if (diff.before !== null || diff.after === null) {
      return null;
    }

    // 打った駒のプレイヤーが現在のプレイヤーと一致するか確認
    if (diff.after.player !== currentPlayer) {
      return null;
    }

    // 持ち駒から削除されているか確認
    const playerCapturedDiff = currentPlayer === "SENTE" ? capturedDiff.sente : capturedDiff.gote;

    if (!playerCapturedDiff.removed.includes(diff.after.type)) {
      return null;
    }

    return {
      type: MoveType.Drop,
      to: diff.position,
      piece: diff.after,
      promoted: false,
    };
  }

  // cellDiffsが2つの場合は通常の移動または成り
  // fromとtoを特定
  const fromDiff = cellDiffs.find((d) => d.before !== null && d.after === null);
  const toDiff = cellDiffs.find((d) => d.after !== null);

  if (!fromDiff || !toDiff) {
    return null;
  }

  const movedPiece = fromDiff.before;
  const destinationPiece = toDiff.after;

  if (!movedPiece || !destinationPiece) {
    return null;
  }

  // 移動した駒のプレイヤーが現在のプレイヤーと一致するか確認
  if (movedPiece.player !== currentPlayer) {
    return null;
  }

  // 移動先の駒のプレイヤーが現在のプレイヤーと一致するか確認
  if (destinationPiece.player !== currentPlayer) {
    return null;
  }

  // 成ったかどうかを判定
  const promoted = movedPiece.type !== destinationPiece.type;

  // 成った場合、成り駒が正しいか確認
  if (promoted) {
    const expectedPromoted = pieces[movedPiece.type].promoted;
    if (expectedPromoted !== destinationPiece.type) {
      return null;
    }
  }

  // 駒を取ったかどうかを判定
  let captured: BoardPiece | undefined;
  if (toDiff.before !== null) {
    captured = toDiff.before;

    // 持ち駒に追加されているか確認
    const playerCapturedDiff = currentPlayer === "SENTE" ? capturedDiff.sente : capturedDiff.gote;

    // 取った駒が成り駒の場合、元の駒に戻して持ち駒に追加される
    const capturedType = pieces[captured.type].unpromoted ?? captured.type;

    if (!playerCapturedDiff.added.includes(capturedType)) {
      return null;
    }
  }

  return {
    type: MoveType.Move,
    from: fromDiff.position,
    to: toDiff.position,
    piece: destinationPiece,
    captured,
    promoted,
  };
}
