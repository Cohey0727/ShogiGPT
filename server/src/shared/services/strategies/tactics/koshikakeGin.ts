import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";
import type { SingleStrategy } from "../types";

/**
 * 腰掛け銀の条件
 * 先手: 銀5六、歩5七
 */
const koshikakeGinConditions: PieceConditionSet = {
  type: "and",
  conditions: [
    { piece: PieceType.Silver, position: { row: 5, col: 4 } },
    { piece: PieceType.Pawn, position: { row: 6, col: 4 } },
  ], // 5六
};

/**
 * 腰掛け銀
 */
export const koshikakeGin: SingleStrategy = {
  name: "腰掛け銀",
  type: "single",
  match: (board: Board, player: Player) =>
    matchBoardConditions(board, koshikakeGinConditions, player),
  turnRange: { to: 30 },
};
