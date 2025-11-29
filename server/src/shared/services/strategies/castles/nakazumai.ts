import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";

/**
 * 中住まいの条件
 * 玉5九or5八、金4九or4八
 */
const nakazumaiConditions: PieceConditionSet[] = [
  {
    type: "or",
    conditions: [
      { type: PieceType.King, position: { row: 8, col: 4 } }, // 5九
      { type: PieceType.King, position: { row: 7, col: 4 } }, // 5八
    ],
  },
  {
    type: "or",
    conditions: [
      { type: PieceType.Gold, position: { row: 8, col: 5 } }, // 4九
      { type: PieceType.Gold, position: { row: 7, col: 5 } }, // 4八
    ],
  },
];

/**
 * 盤面が中住まいの形かどうかを判定
 *
 * @param board - 盤面
 * @param player - 判定対象のプレイヤー
 * @returns 中住まいの条件を満たせばtrue
 */
export function isNakazumai(board: Board, player: Player): boolean {
  return matchBoardConditions(board, nakazumaiConditions, player);
}
