import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";

/**
 * 銀矢倉の条件
 * 玉8八、金7八・6七、銀6八
 */
const ginYaguraConditions: PieceConditionSet[] = [
  {
    type: "and",
    conditions: [
      { type: PieceType.King, position: { row: 7, col: 1 } }, // 8八
      { type: PieceType.Gold, position: { row: 7, col: 2 } }, // 7八
      { type: PieceType.Gold, position: { row: 6, col: 3 } }, // 6七
      { type: PieceType.Silver, position: { row: 7, col: 3 } }, // 6八
    ],
  },
];

/**
 * 盤面が銀矢倉の形かどうかを判定
 *
 * @param board - 盤面
 * @param player - 判定対象のプレイヤー
 * @returns 銀矢倉の条件を満たせばtrue
 */
export function isGinYagura(board: Board, player: Player): boolean {
  return matchBoardConditions(board, ginYaguraConditions, player);
}
