import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";
import type { SingleStrategy } from "../types";

/**
 * 片美濃の条件
 * 玉2八、金3八、銀4九
 */
const kataMinoConditions: PieceConditionSet = {
  type: "and",
  conditions: [
    { piece: PieceType.King, position: { row: 7, col: 7 } }, // 2八
    { piece: PieceType.Gold, position: { row: 7, col: 6 } }, // 3八
    { piece: PieceType.Silver, position: { row: 8, col: 5 } }, // 4九
  ],
};

/**
 * 片美濃
 */
export const kataMino: SingleStrategy = {
  name: "片美濃",
  type: "single",
  match: (board: Board, player: Player) => matchBoardConditions(board, kataMinoConditions, player),
  turnRange: { to: 30 },
};
