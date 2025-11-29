import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";

/**
 * 銀冠の条件
 * 玉2八、金3八・4七、銀2七
 */
const ginkanmuriConditions: PieceConditionSet[] = [
  {
    type: "and",
    conditions: [
      { type: PieceType.King, position: { row: 7, col: 7 } }, // 2八
      { type: PieceType.Gold, position: { row: 7, col: 6 } }, // 3八
      { type: PieceType.Gold, position: { row: 6, col: 5 } }, // 4七
      { type: PieceType.Silver, position: { row: 6, col: 7 } }, // 2七
    ],
  },
];

/**
 * 盤面が銀冠の形かどうかを判定
 *
 * @param board - 盤面
 * @param player - 判定対象のプレイヤー
 * @returns 銀冠の条件を満たせばtrue
 */
export function isGinkanmuri(board: Board, player: Player): boolean {
  return matchBoardConditions(board, ginkanmuriConditions, player);
}
