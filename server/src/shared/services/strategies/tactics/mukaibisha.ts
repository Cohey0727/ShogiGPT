import type { Board } from "../../../consts/shogi";
import { PieceType, Player } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";
import type { BothStrategy } from "../types";

/**
 * 向かい飛車の条件（先手基準）
 * 飛8八
 */
const mukaibishaConditions: PieceConditionSet = {
  type: "and",
  conditions: [{ piece: PieceType.Rook, position: { row: 7, col: 1 } }], // 8八
};

/**
 * 居飛車の条件（先手基準）
 * 飛2八
 */
const ibishaConditions: PieceConditionSet = {
  type: "and",
  conditions: [{ piece: PieceType.Rook, position: { row: 7, col: 7 } }], // 2八
};

/**
 * 向かい飛車（相手が居飛車のとき、相手の飛車の正面に飛車を振る）
 */
export const mukaibisha: BothStrategy = {
  name: "向かい飛車",
  type: "both",
  match: (board: Board) => {
    // 先手向かい飛車: 先手が8八に飛車、後手が居飛車
    const senteMukai =
      matchBoardConditions(board, mukaibishaConditions, Player.Sente) &&
      matchBoardConditions(board, ibishaConditions, Player.Gote);

    // 後手向かい飛車: 後手が2二に飛車、先手が居飛車
    const goteMukai =
      matchBoardConditions(board, mukaibishaConditions, Player.Gote) &&
      matchBoardConditions(board, ibishaConditions, Player.Sente);

    return senteMukai || goteMukai;
  },
  turnRange: { from: 5 },
};
