import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";
import type { SingleStrategy } from "../types";

/**
 * ミレニアムの条件
 * 飛2八、玉6八、金7八・7九、銀8八
 */
const millenniumConditions: PieceConditionSet = {
  type: "and",
  conditions: [
    { piece: PieceType.Rook, position: { row: 7, col: 7 } }, // 2八
    { piece: PieceType.King, position: { row: 7, col: 3 } }, // 6八
    { piece: PieceType.Gold, position: { row: 7, col: 2 } }, // 7八
    { piece: PieceType.Gold, position: { row: 8, col: 2 } }, // 7九
    { piece: PieceType.Silver, position: { row: 7, col: 1 } }, // 8八
  ],
};

/**
 * ミレニアム
 */
export const millennium: SingleStrategy = {
  name: "ミレニアム",
  type: "single",
  match: (board: Board, player: Player) =>
    matchBoardConditions(board, millenniumConditions, player),
  turnRange: { to: 30 },
};
