import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";
import type { SingleStrategy } from "../types";

/**
 * 銀矢倉の条件
 * 玉8八、金7八・6七、銀6八
 */
const ginYaguraConditions: PieceConditionSet = {
  type: "and",
  conditions: [
    { piece: PieceType.King, position: { row: 7, col: 1 } }, // 8八
    { piece: PieceType.Gold, position: { row: 7, col: 2 } }, // 7八
    { piece: PieceType.Gold, position: { row: 6, col: 3 } }, // 6七
    { piece: PieceType.Silver, position: { row: 7, col: 3 } }, // 6八
  ],
};

/**
 * 銀矢倉
 */
export const ginYagura: SingleStrategy = {
  name: "銀矢倉",
  type: "single",
  match: (board: Board, player: Player) => matchBoardConditions(board, ginYaguraConditions, player),
  turnRange: { to: 30 },
};
