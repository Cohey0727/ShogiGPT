import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";
import type { SingleStrategy } from "../types";

/**
 * 木村美濃の条件
 * 玉2八、金3八・5七、銀4六
 */
const kimuraMinoConditions: PieceConditionSet = {
  type: "and",
  conditions: [
    { piece: PieceType.King, position: { row: 7, col: 7 } }, // 2八
    { piece: PieceType.Gold, position: { row: 7, col: 6 } }, // 3八
    { piece: PieceType.Gold, position: { row: 6, col: 4 } }, // 5七
    { piece: PieceType.Silver, position: { row: 5, col: 5 } }, // 4六
  ],
};

/**
 * 木村美濃
 */
export const kimuraMino: SingleStrategy = {
  name: "木村美濃",
  type: "single",
  match: (board: Board, player: Player) =>
    matchBoardConditions(board, kimuraMinoConditions, player),
  turnRange: { from: 20 },
};
