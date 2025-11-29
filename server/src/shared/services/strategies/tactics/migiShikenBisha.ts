import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";
import type { SingleStrategy } from "../types";

/**
 * 右四間飛車の条件
 * 飛4八
 */
const migiShikenBishaConditions: PieceConditionSet = {
  type: "and",
  conditions: [{ piece: PieceType.Rook, position: { row: 7, col: 5 } }], // 4八
};

/**
 * 右四間飛車
 */
export const migiShikenBisha: SingleStrategy = {
  name: "右四間飛車",
  type: "single",
  match: (board: Board, player: Player) =>
    matchBoardConditions(board, migiShikenBishaConditions, player),
  turnRange: { to: 30 },
};
