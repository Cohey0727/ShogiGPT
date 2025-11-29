import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";
import type { SingleStrategy } from "../types";

/**
 * カニ囲いの条件
 * 玉6九、金5八・7八、銀6八
 */
const kaniGakoiConditions: PieceConditionSet = {
  type: "and",
  conditions: [
    { piece: PieceType.King, position: { row: 8, col: 3 } }, // 6九
    { piece: PieceType.Gold, position: { row: 7, col: 4 } }, // 5八
    { piece: PieceType.Gold, position: { row: 7, col: 2 } }, // 7八
    { piece: PieceType.Silver, position: { row: 7, col: 3 } }, // 6八
  ],
};

/**
 * カニ囲い
 */
export const kaniGakoi: SingleStrategy = {
  name: "カニ囲い",
  type: "single",
  match: (board: Board, player: Player) => matchBoardConditions(board, kaniGakoiConditions, player),
  turnRange: { to: 30 },
};
