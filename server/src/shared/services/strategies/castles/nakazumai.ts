import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";
import type { SingleStrategy } from "../types";

/**
 * 中住まいの条件
 * 玉5九or5八、金4九or4八
 */
const nakazumaiConditions: PieceConditionSet = {
  type: "and",
  conditions: [
    {
      type: "or",
      conditions: [
        { piece: PieceType.King, position: { row: 8, col: 4 } }, // 5九
        { piece: PieceType.King, position: { row: 7, col: 4 } }, // 5八
      ],
    },
    {
      type: "or",
      conditions: [
        { piece: PieceType.Gold, position: { row: 8, col: 5 } }, // 4九
        { piece: PieceType.Gold, position: { row: 7, col: 5 } }, // 4八
      ],
    },
  ],
};

/**
 * 中住まい
 */
export const nakazumai: SingleStrategy = {
  name: "中住まい",
  type: "single",
  match: (board: Board, player: Player) => matchBoardConditions(board, nakazumaiConditions, player),
  turnRange: { from: 20 },
};
