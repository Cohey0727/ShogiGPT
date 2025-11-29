import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";
import type { SingleStrategy } from "../types";

/**
 * ボナンザ囲いの条件
 * 玉7九、金6八・7八
 */
const bonanzaGakoiConditions: PieceConditionSet = {
  type: "and",
  conditions: [
    { piece: PieceType.King, position: { row: 8, col: 2 } }, // 7九
    { piece: PieceType.Gold, position: { row: 7, col: 3 } }, // 6八
    { piece: PieceType.Gold, position: { row: 7, col: 2 } }, // 7八
  ],
};

/**
 * ボナンザ囲い
 */
export const bonanzaGakoi: SingleStrategy = {
  name: "ボナンザ囲い",
  type: "single",
  match: (board: Board, player: Player) =>
    matchBoardConditions(board, bonanzaGakoiConditions, player),
  turnRange: { from: 20 },
};
