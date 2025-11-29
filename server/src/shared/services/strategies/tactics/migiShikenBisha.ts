import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";

/**
 * 右四間飛車の条件
 * 先手: 飛4八、銀5六
 * 後手: 飛6二、銀5四
 */
const migiShikenbishaConditions: PieceConditionSet[] = [
  {
    type: "and",
    conditions: [
      { type: PieceType.Rook, position: { row: 7, col: 5 } }, // 4八
      { type: PieceType.Silver, position: { row: 5, col: 4 } }, // 5六
    ],
  },
];

/**
 * 盤面が右四間飛車の形かどうかを判定
 *
 * @param board - 盤面
 * @param player - 判定対象のプレイヤー
 * @returns 右四間飛車の条件を満たせばtrue
 */
export function isMigiShikenBisha(board: Board, player: Player): boolean {
  return matchBoardConditions(board, migiShikenbishaConditions, player);
}
