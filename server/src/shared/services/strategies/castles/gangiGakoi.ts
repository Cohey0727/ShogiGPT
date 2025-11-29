import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";
import type { SingleStrategy } from "../types";

/**
 * 雁木囲いの条件
 * 玉6九or7九、金5八・7八、銀4七・6七
 */
const gangiGakoiConditions: PieceConditionSet = {
  type: "and",
  conditions: [
    {
      type: "or",
      conditions: [
        { piece: PieceType.King, position: { row: 8, col: 3 } }, // 6九
        { piece: PieceType.King, position: { row: 8, col: 2 } }, // 7九
      ],
    },
    { piece: PieceType.Gold, position: { row: 7, col: 4 } }, // 5八
    { piece: PieceType.Gold, position: { row: 7, col: 2 } }, // 7八
    { piece: PieceType.Silver, position: { row: 6, col: 5 } }, // 4七
    { piece: PieceType.Silver, position: { row: 6, col: 3 } }, // 6七
  ],
};

/**
 * 雁木囲い
 */
export const gangiGakoi: SingleStrategy = {
  name: "雁木囲い",
  type: "single",
  match: (board: Board, player: Player) =>
    matchBoardConditions(board, gangiGakoiConditions, player),
  turnRange: { from: 20 },
};
