import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";
import type { SingleStrategy } from "../types";

/**
 * 天守閣美濃の条件
 * 飛2八、玉8七、金5八・6八、銀7八
 */
const tenshukakuMinoConditions: PieceConditionSet = {
  type: "and",
  conditions: [
    { piece: PieceType.Rook, position: { row: 7, col: 7 } }, // 2八
    { piece: PieceType.King, position: { row: 6, col: 1 } }, // 8七
    { piece: PieceType.Gold, position: { row: 7, col: 4 } }, // 5八
    { piece: PieceType.Gold, position: { row: 7, col: 3 } }, // 6八
    { piece: PieceType.Silver, position: { row: 7, col: 2 } }, // 7八
  ],
};

/**
 * 天守閣美濃
 */
export const tenshukakuMino: SingleStrategy = {
  name: "天守閣美濃",
  type: "single",
  match: (board: Board, player: Player) =>
    matchBoardConditions(board, tenshukakuMinoConditions, player),
  turnRange: { to: 30 },
};
