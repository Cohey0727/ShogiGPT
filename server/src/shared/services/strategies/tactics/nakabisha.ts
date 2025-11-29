import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";

/**
 * 中飛車の条件
 * 先手: 飛5八
 * 後手: 飛5二
 */
const nakabishaConditions: PieceConditionSet[] = [
  {
    type: "and",
    conditions: [{ type: PieceType.Rook, position: { row: 7, col: 4 } }], // 5八
  },
];

/**
 * 盤面が中飛車の形かどうかを判定
 *
 * @param board - 盤面
 * @param player - 判定対象のプレイヤー
 * @returns 中飛車の条件を満たせばtrue
 */
export function isNakabisha(board: Board, player: Player): boolean {
  return matchBoardConditions(board, nakabishaConditions, player);
}
