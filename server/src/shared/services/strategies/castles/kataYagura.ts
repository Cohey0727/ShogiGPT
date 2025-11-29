import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";
import type { SingleStrategy } from "../types";

/**
 * 片矢倉（天野矢倉）の条件
 * 玉7八、金6七・6八、銀7七
 */
const kataYaguraConditions: PieceConditionSet = {
  type: "and",
  conditions: [
    { piece: PieceType.King, position: { row: 7, col: 2 } }, // 7八
    { piece: PieceType.Gold, position: { row: 6, col: 3 } }, // 6七
    { piece: PieceType.Gold, position: { row: 7, col: 3 } }, // 6八
    { piece: PieceType.Silver, position: { row: 6, col: 2 } }, // 7七
  ],
};

/**
 * 片矢倉
 */
export const kataYagura: SingleStrategy = {
  name: "片矢倉",
  type: "single",
  match: (board: Board, player: Player) =>
    matchBoardConditions(board, kataYaguraConditions, player),
  turnRange: { from: 20 },
};
