import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";
import type { SingleStrategy } from "../types";

/**
 * 居飛車の条件
 * 先手: 飛2八
 * 後手: 飛8二
 */
const ibishaConditions: PieceConditionSet = {
  type: "and",
  conditions: [{ piece: PieceType.Rook, position: { row: 7, col: 7 } }], // 2八
};

/**
 * 居飛車
 */
export const ibisha: SingleStrategy = {
  name: "居飛車",
  type: "single",
  match: (board: Board, player: Player) => matchBoardConditions(board, ibishaConditions, player),
  turnRange: { from: 20, to: 30 },
};
