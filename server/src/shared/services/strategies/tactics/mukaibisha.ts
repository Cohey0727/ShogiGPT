import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";

/**
 * 向かい飛車の条件
 * 先手: 飛8八
 * 後手: 飛2二
 */
const mukaibishaConditions: PieceConditionSet[] = [
  {
    type: "and",
    conditions: [{ type: PieceType.Rook, position: { row: 7, col: 1 } }], // 8八
  },
];

/**
 * 盤面が向かい飛車の形かどうかを判定
 *
 * @param board - 盤面
 * @param player - 判定対象のプレイヤー
 * @returns 向かい飛車の条件を満たせばtrue
 */
export function isMukaibisha(board: Board, player: Player): boolean {
  return matchBoardConditions(board, mukaibishaConditions, player);
}
