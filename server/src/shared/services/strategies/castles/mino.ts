import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";
import type { SingleStrategy } from "../types";

/**
 * 美濃囲いの条件
 * 玉2八、金3八・5八
 */
const minoConditions: PieceConditionSet = {
  type: "and",
  conditions: [
    { piece: PieceType.King, position: { row: 7, col: 7 } }, // 2八
    { piece: PieceType.Gold, position: { row: 7, col: 6 } }, // 3八
    { piece: PieceType.Gold, position: { row: 7, col: 4 } }, // 5八
  ],
};

/**
 * 美濃囲い
 */
export const mino: SingleStrategy = {
  name: "美濃囲い",
  type: "single",
  match: (board: Board, player: Player) => matchBoardConditions(board, minoConditions, player),
  turnRange: { to: 30 },
};
