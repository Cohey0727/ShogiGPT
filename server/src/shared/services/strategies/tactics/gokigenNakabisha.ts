import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";
import type { SingleStrategy } from "../types";

/**
 * ゴキゲン中飛車の条件
 * 飛5八、歩5五、角7七
 */
const gokigenNakabishaConditions: PieceConditionSet[] = [
  {
    type: "and",
    conditions: [
      { type: PieceType.Rook, position: { row: 7, col: 4 } }, // 5八
      { type: PieceType.Pawn, position: { row: 4, col: 4 } }, // 5五
      { type: PieceType.Bishop, position: { row: 6, col: 2 } }, // 7七
    ],
  },
];

/**
 * ゴキゲン中飛車
 */
export const gokigenNakabisha: SingleStrategy = {
  name: "ゴキゲン中飛車",
  type: "single",
  match: (board: Board, player: Player) =>
    matchBoardConditions(board, gokigenNakabishaConditions, player),
  turnRange: { from: 10 },
};
