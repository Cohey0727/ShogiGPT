import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";

/**
 * 腰掛け銀の条件
 * 先手: 銀5六
 * 後手: 銀5四
 */
const koshikakeGinConditions: PieceConditionSet[] = [
  {
    type: "and",
    conditions: [{ type: PieceType.Silver, position: { row: 5, col: 4 } }], // 5六
  },
];

/**
 * 盤面が腰掛け銀の形かどうかを判定
 *
 * @param board - 盤面
 * @param player - 判定対象のプレイヤー
 * @returns 腰掛け銀の条件を満たせばtrue
 */
export function isKoshikakeGin(board: Board, player: Player): boolean {
  return matchBoardConditions(board, koshikakeGinConditions, player);
}
