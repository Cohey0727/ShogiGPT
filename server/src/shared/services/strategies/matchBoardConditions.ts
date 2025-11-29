import type { Board, PieceType, Player, Position } from "../../consts/shogi";

/**
 * 駒の位置条件
 */
export interface PieceCondition {
  /** 駒の種類 */
  type: PieceType;
  /** 位置、部分的に指定可能（undefinedの軸は任意） */
  position: Partial<Position>;
}

/**
 * 駒条件の集合
 */
export interface PieceConditionSet {
  /** 条件の結合タイプ（and: すべて満たす、or: いずれか満たす） */
  type: "and" | "or";
  /** 駒条件の配列 */
  conditions: PieceCondition[];
}

/**
 * 盤面が指定した条件を満たすかどうかを判定
 *
 * @param board - 盤面
 * @param conditions - 駒条件セットの配列
 * @param player - 判定対象のプレイヤー
 * @returns 条件を満たせばtrue
 */
export function matchBoardConditions(
  board: Board,
  conditions: PieceConditionSet[],
  player: Player,
): boolean {
  for (const set of conditions) {
    const results = set.conditions.map((condition) => {
      const pos = transformForPlayer(condition.position, player);
      return hasPieceAt(board, pos, condition.type, player);
    });

    if (set.type === "and") {
      if (!results.every(Boolean)) {
        return false;
      }
    } else {
      if (!results.some(Boolean)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * 後手の場合に座標を反転
 *
 * @param position - 位置
 * @param player - プレイヤー
 * @returns 反転後の位置
 */
function transformForPlayer(position: Partial<Position>, player: Player): Partial<Position> {
  if (player === "SENTE") {
    return position;
  }
  // 後手の場合は座標を反転（8 - index）
  return {
    row: position.row !== undefined ? ((8 - position.row) as Position["row"]) : undefined,
    col: position.col !== undefined ? ((8 - position.col) as Position["col"]) : undefined,
  };
}

/**
 * 指定した位置に指定した駒があるかどうかを判定
 * positionのプロパティがundefinedの場合、その軸は問わない
 *
 * @param board - 盤面
 * @param position - 位置（undefinedの軸は任意）
 * @param pieceType - 駒の種類
 * @param player - プレイヤー
 * @returns 駒があればtrue
 */
function hasPieceAt(
  board: Board,
  position: Partial<Position>,
  pieceType: PieceType,
  player: Player,
): boolean {
  const rowRange = position.row !== undefined ? [position.row] : [0, 1, 2, 3, 4, 5, 6, 7, 8];
  const colRange = position.col !== undefined ? [position.col] : [0, 1, 2, 3, 4, 5, 6, 7, 8];

  for (const row of rowRange) {
    for (const col of colRange) {
      const cell = board.cells[row]?.[col];
      if (cell && cell.type === pieceType && cell.player === player) {
        return true;
      }
    }
  }

  return false;
}
