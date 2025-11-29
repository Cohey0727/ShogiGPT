import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";
import type { SingleStrategy } from "../types";

/**
 * 棒銀の条件
 * 飛2八、銀2六or2五
 */
const boginConditions: PieceConditionSet[] = [
  {
    type: "and",
    conditions: [{ type: PieceType.Rook, position: { row: 7, col: 7 } }], // 2八
  },
  {
    type: "or",
    conditions: [
      { type: PieceType.Silver, position: { row: 5, col: 7 } }, // 2六
      { type: PieceType.Silver, position: { row: 4, col: 7 } }, // 2五
    ],
  },
];

/**
 * 棒銀
 */
export const bogin: SingleStrategy = {
  name: "棒銀",
  type: "single",
  match: (board: Board, player: Player) => matchBoardConditions(board, boginConditions, player),
  turnRange: { from: 10 },
};
