import type { Board, PieceType, Player, Position } from "../../consts/shogi";

/**
 * 駒の位置条件
 */
export interface PieceCondition {
  /** 駒の種類 */
  piece: PieceType;
  /** 位置、部分的に指定可能（undefinedの軸は任意） */
  position: Partial<Position>;
}

/**
 * 駒条件の集合
 */
export interface PieceConditionSet {
  /** 条件の結合タイプ（and: すべて満たす、or: いずれか満たす） */
  type: "and" | "or";
  /** 駒条件またはネストした条件セットの配列 */
  conditions: (PieceCondition | PieceConditionSet)[];
}

/**
 * PieceConditionSetかどうかを判定
 */
function isPieceConditionSet(
  condition: PieceCondition | PieceConditionSet,
): condition is PieceConditionSet {
  return "conditions" in condition;
}

/**
 * 盤面が指定した条件セットを満たすかどうかを判定（再帰的にネストした条件も評価）
 *
 * @param board - 盤面
 * @param conditionSet - 駒条件セット
 * @param player - 判定対象のプレイヤー
 * @returns 条件を満たせばtrue
 */
export function matchBoardConditions(
  board: Board,
  conditionSet: PieceConditionSet,
  player: Player,
): boolean {
  const results = conditionSet.conditions.map((condition) => {
    if (isPieceConditionSet(condition)) {
      return matchBoardConditions(board, condition, player);
    }
    const pos = transformForPlayer(condition.position, player);
    return hasPieceAt(board, pos, condition.piece, player);
  });

  if (conditionSet.type === "and") {
    return results.every(Boolean);
  }
  return results.some(Boolean);
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
