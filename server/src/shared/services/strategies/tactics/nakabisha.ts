import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";
import type { SingleStrategy } from "../types";

/**
 * 中飛車の条件
 * 飛5八
 */
const nakabishaConditions: PieceConditionSet = {
  type: "and",
  conditions: [{ piece: PieceType.Rook, position: { row: 7, col: 4 } }], // 5八
};

/**
 * 中飛車
 */
export const nakabisha: SingleStrategy = {
  name: "中飛車",
  type: "single",
  match: (board: Board, player: Player) => matchBoardConditions(board, nakabishaConditions, player),
  turnRange: { to: 30 },
};
