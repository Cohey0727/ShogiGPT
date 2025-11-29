import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";
import type { SingleStrategy } from "../types";

/**
 * 四間飛車の条件
 * 飛6八
 */
const shikenBishaConditions: PieceConditionSet = {
  type: "and",
  conditions: [{ piece: PieceType.Rook, position: { row: 7, col: 3 } }], // 6八
};

/**
 * 四間飛車
 */
export const shikenBisha: SingleStrategy = {
  name: "四間飛車",
  type: "single",
  match: (board: Board, player: Player) =>
    matchBoardConditions(board, shikenBishaConditions, player),
  turnRange: { to: 30 },
};
