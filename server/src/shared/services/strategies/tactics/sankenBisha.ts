import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";
import type { SingleStrategy } from "../types";

/**
 * 三間飛車の条件
 * 飛7八
 */
const sankenBishaConditions: PieceConditionSet = {
  type: "and",
  conditions: [{ piece: PieceType.Rook, position: { row: 7, col: 2 } }], // 7八
};

/**
 * 三間飛車
 */
export const sankenBisha: SingleStrategy = {
  name: "三間飛車",
  type: "single",
  match: (board: Board, player: Player) =>
    matchBoardConditions(board, sankenBishaConditions, player),
  turnRange: { from: 5 },
};
