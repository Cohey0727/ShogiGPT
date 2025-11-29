import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";
import type { SingleStrategy } from "../types";

/**
 * 早繰り銀の条件
 * 先手: 銀4六
 */
const hayakuriGinConditions: PieceConditionSet[] = [
  {
    type: "and",
    conditions: [{ type: PieceType.Silver, position: { row: 5, col: 5 } }], // 4六
  },
];

/**
 * 早繰り銀
 */
export const hayakuriGin: SingleStrategy = {
  name: "早繰り銀",
  type: "single",
  match: (board: Board, player: Player) =>
    matchBoardConditions(board, hayakuriGinConditions, player),
  turnRange: { from: 10 },
};
