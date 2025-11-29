import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";
import type { SingleStrategy } from "../types";

/**
 * 銀冠穴熊の条件
 * 飛2八、玉9九、金7九・6八、銀8八・7七、香9八
 */
const ginkanmuriAnagumaConditions: PieceConditionSet = {
  type: "and",
  conditions: [
    { piece: PieceType.Rook, position: { row: 7, col: 7 } }, // 2八
    { piece: PieceType.King, position: { row: 8, col: 0 } }, // 9九
    { piece: PieceType.Gold, position: { row: 8, col: 2 } }, // 7九
    { piece: PieceType.Gold, position: { row: 7, col: 3 } }, // 6八
    { piece: PieceType.Silver, position: { row: 7, col: 1 } }, // 8八
    { piece: PieceType.Silver, position: { row: 6, col: 2 } }, // 7七
    { piece: PieceType.Lance, position: { row: 7, col: 0 } }, // 9八
  ],
};

/**
 * 銀冠穴熊
 */
export const ginkanmuriAnaguma: SingleStrategy = {
  name: "銀冠穴熊",
  type: "single",
  match: (board: Board, player: Player) =>
    matchBoardConditions(board, ginkanmuriAnagumaConditions, player),
  turnRange: { to: 40 },
};
