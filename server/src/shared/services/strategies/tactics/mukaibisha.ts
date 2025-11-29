import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";
import type { SingleStrategy } from "../types";

/**
 * 向かい飛車の条件
 * 先手: 飛8八
 * 後手: 飛2二
 */
const mukaibishaConditions: PieceConditionSet[] = [
  {
    type: "and",
    conditions: [{ type: PieceType.Rook, position: { row: 7, col: 1 } }], // 8八
  },
];

/**
 * 向かい飛車
 */
export const mukaibisha: SingleStrategy = {
  name: "向かい飛車",
  type: "single",
  match: (board: Board, player: Player) =>
    matchBoardConditions(board, mukaibishaConditions, player),
  turnRange: { from: 5 },
};
