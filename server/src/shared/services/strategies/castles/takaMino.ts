import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";
import type { SingleStrategy } from "../types";

/**
 * 高美濃の条件
 * 玉2八、金3八・4七、銀4九
 */
const takaMinoConditions: PieceConditionSet = {
  type: "and",
  conditions: [
    { piece: PieceType.King, position: { row: 7, col: 7 } }, // 2八
    { piece: PieceType.Gold, position: { row: 7, col: 6 } }, // 3八
    { piece: PieceType.Gold, position: { row: 6, col: 5 } }, // 4七
    { piece: PieceType.Silver, position: { row: 8, col: 5 } }, // 4九
  ],
};

/**
 * 高美濃
 */
export const takaMino: SingleStrategy = {
  name: "高美濃",
  type: "single",
  match: (board: Board, player: Player) => matchBoardConditions(board, takaMinoConditions, player),
  turnRange: { to: 30 },
};
