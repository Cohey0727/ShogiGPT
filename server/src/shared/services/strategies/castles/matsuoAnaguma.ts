import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";
import type { SingleStrategy } from "../types";

/**
 * 松尾流穴熊の条件
 * 飛2八、玉9九、金7九・8八、銀7八、香9八
 */
const matsuoAnagumaConditions: PieceConditionSet = {
  type: "and",
  conditions: [
    { piece: PieceType.Rook, position: { row: 7, col: 7 } }, // 2八
    { piece: PieceType.King, position: { row: 8, col: 0 } }, // 9九
    { piece: PieceType.Gold, position: { row: 8, col: 2 } }, // 7九
    { piece: PieceType.Gold, position: { row: 7, col: 1 } }, // 8八
    { piece: PieceType.Silver, position: { row: 7, col: 2 } }, // 7八
    { piece: PieceType.Lance, position: { row: 7, col: 0 } }, // 9八
  ],
};

/**
 * 松尾流穴熊
 */
export const matsuoAnaguma: SingleStrategy = {
  name: "松尾流穴熊",
  type: "single",
  match: (board: Board, player: Player) =>
    matchBoardConditions(board, matsuoAnagumaConditions, player),
  turnRange: { from: 20 },
};
