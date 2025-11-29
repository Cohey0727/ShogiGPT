import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";
import type { SingleStrategy } from "../types";

/**
 * 金矢倉の条件
 * 玉8八、金7八・6七、銀7七
 */
const kinYaguraConditions: PieceConditionSet = {
  type: "and",
  conditions: [
    { piece: PieceType.King, position: { row: 7, col: 1 } }, // 8八
    { piece: PieceType.Gold, position: { row: 7, col: 2 } }, // 7八
    { piece: PieceType.Gold, position: { row: 6, col: 3 } }, // 6七
    { piece: PieceType.Silver, position: { row: 6, col: 2 } }, // 7七
  ],
};

/**
 * 金矢倉
 */
export const kinYagura: SingleStrategy = {
  name: "金矢倉",
  type: "single",
  match: (board: Board, player: Player) => matchBoardConditions(board, kinYaguraConditions, player),
  turnRange: { from: 20 },
};
