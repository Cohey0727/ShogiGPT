import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";
import type { SingleStrategy } from "../types";

/**
 * ダイヤモンド美濃の条件
 * 玉2八、金3八・4七、銀3七
 */
const diamondMinoConditions: PieceConditionSet = {
  type: "and",
  conditions: [
    { piece: PieceType.King, position: { row: 7, col: 7 } }, // 2八
    { piece: PieceType.Gold, position: { row: 7, col: 6 } }, // 3八
    { piece: PieceType.Gold, position: { row: 6, col: 5 } }, // 4七
    { piece: PieceType.Silver, position: { row: 6, col: 6 } }, // 3七
  ],
};

/**
 * ダイヤモンド美濃
 */
export const diamondMino: SingleStrategy = {
  name: "ダイヤモンド美濃",
  type: "single",
  match: (board: Board, player: Player) =>
    matchBoardConditions(board, diamondMinoConditions, player),
  turnRange: { to: 30 },
};
