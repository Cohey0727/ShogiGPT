import type { Board, Position, Cell, PieceType } from "../shared/consts/shogi";

/**
 * 盤上の差分情報
 */
export interface CellDiff {
  /** 位置 */
  position: Position;
  /** 変更前のセル */
  before: Cell;
  /** 変更後のセル */
  after: Cell;
}

/**
 * 持ち駒の差分情報
 */
export interface CapturedDiff {
  /** 先手の持ち駒の差分 */
  sente: {
    /** 追加された駒 */
    added: PieceType[];
    /** 削除された駒 */
    removed: PieceType[];
  };
  /** 後手の持ち駒の差分 */
  gote: {
    /** 追加された駒 */
    added: PieceType[];
    /** 削除された駒 */
    removed: PieceType[];
  };
}

/**
 * ボードの差分情報
 */
export interface BoardDiff {
  /** 盤上のセルの差分 */
  cellDiffs: CellDiff[];
  /** 持ち駒の差分 */
  capturedDiff: CapturedDiff;
  /** 手番が変更されたか */
  turnChanged: boolean;
}

/**
 * 2つの駒が等しいかを判定
 */
function arePiecesEqual(piece1: Cell, piece2: Cell): boolean {
  if (piece1 === null && piece2 === null) return true;
  if (piece1 === null || piece2 === null) return false;
  return piece1.type === piece2.type && piece1.player === piece2.player;
}

/**
 * 2つの配列の差分を計算
 */
function getArrayDiff<T>(
  before: T[],
  after: T[]
): { added: T[]; removed: T[] } {
  const beforeCopy = [...before];
  const afterCopy = [...after];
  const added: T[] = [];
  const removed: T[] = [];

  // afterに存在してbeforeに存在しない要素を探す
  for (const item of afterCopy) {
    const index = beforeCopy.indexOf(item);
    if (index === -1) {
      added.push(item);
    } else {
      beforeCopy.splice(index, 1);
    }
  }

  // beforeに残った要素は削除された要素
  removed.push(...beforeCopy);

  return { added, removed };
}

/**
 * 2つのボード情報から差分を検出する
 *
 * @param before - 変更前のボード
 * @param after - 変更後のボード
 * @returns ボードの差分情報
 */
export function getBoardDiff(before: Board, after: Board): BoardDiff {
  const cellDiffs: CellDiff[] = [];

  // 盤上のセルの差分を検出
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const beforeCell = before.cells[row][col];
      const afterCell = after.cells[row][col];

      if (!arePiecesEqual(beforeCell, afterCell)) {
        cellDiffs.push({
          position: {
            row: row as Position["row"],
            col: col as Position["col"],
          },
          before: beforeCell,
          after: afterCell,
        });
      }
    }
  }

  // 持ち駒の差分を検出
  const senteDiff = getArrayDiff(before.capturedBySente, after.capturedBySente);
  const goteDiff = getArrayDiff(before.capturedByGote, after.capturedByGote);

  const capturedDiff: CapturedDiff = {
    sente: senteDiff,
    gote: goteDiff,
  };

  // 手番の変更を検出
  const turnChanged = before.turn !== after.turn;

  return {
    cellDiffs,
    capturedDiff,
    turnChanged,
  };
}
