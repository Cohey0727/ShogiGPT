import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";
import type { SingleStrategy } from "../types";

/**
 * 金無双の条件
 * 玉3八、金4八・5八、銀2八
 */
const kinmusoConditions: PieceConditionSet = {
  type: "and",
  conditions: [
    { piece: PieceType.King, position: { row: 7, col: 6 } }, // 3八
    { piece: PieceType.Gold, position: { row: 7, col: 5 } }, // 4八
    { piece: PieceType.Gold, position: { row: 7, col: 4 } }, // 5八
    { piece: PieceType.Silver, position: { row: 7, col: 7 } }, // 2八
  ],
};

/**
 * 金無双
 */
export const kinmuso: SingleStrategy = {
  name: "金無双",
  type: "single",
  match: (board: Board, player: Player) => matchBoardConditions(board, kinmusoConditions, player),
  turnRange: { to: 30 },
};
