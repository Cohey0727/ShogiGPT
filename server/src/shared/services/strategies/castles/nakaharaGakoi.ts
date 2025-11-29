import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";
import type { SingleStrategy } from "../types";

/**
 * 中原囲いの条件
 * 玉4八、金5八・3八
 */
const nakaharaGakoiConditions: PieceConditionSet = {
  type: "and",
  conditions: [
    { piece: PieceType.King, position: { row: 7, col: 5 } }, // 4八
    { piece: PieceType.Gold, position: { row: 7, col: 4 } }, // 5八
    { piece: PieceType.Gold, position: { row: 7, col: 6 } }, // 3八
  ],
};

/**
 * 中原囲い
 */
export const nakaharaGakoi: SingleStrategy = {
  name: "中原囲い",
  type: "single",
  match: (board: Board, player: Player) =>
    matchBoardConditions(board, nakaharaGakoiConditions, player),
  turnRange: { to: 30 },
};
