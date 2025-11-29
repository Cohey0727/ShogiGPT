import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";
import type { SingleStrategy } from "../types";

/**
 * エルモ囲いの条件
 * 飛2八、玉7八、金7九・5八、銀6八or5七
 */
const elmoGakoiConditions: PieceConditionSet = {
  type: "and",
  conditions: [
    { piece: PieceType.Rook, position: { row: 7, col: 7 } }, // 2八
    { piece: PieceType.King, position: { row: 7, col: 2 } }, // 7八
    { piece: PieceType.Gold, position: { row: 8, col: 2 } }, // 7九
    { piece: PieceType.Gold, position: { row: 7, col: 4 } }, // 5八
    {
      type: "or",
      conditions: [
        { piece: PieceType.Silver, position: { row: 7, col: 3 } }, // 6八
        { piece: PieceType.Silver, position: { row: 6, col: 4 } }, // 5七
      ],
    },
  ],
};

/**
 * エルモ囲い
 */
export const elmoGakoi: SingleStrategy = {
  name: "エルモ囲い",
  type: "single",
  match: (board: Board, player: Player) => matchBoardConditions(board, elmoGakoiConditions, player),
  turnRange: { to: 30 },
};
