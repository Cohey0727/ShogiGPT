import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";

/**
 * 金無双の条件
 * 玉3八、金4八・5八、銀2八
 */
const kinmusoConditions: PieceConditionSet[] = [
  {
    type: "and",
    conditions: [
      { piece: PieceType.King, position: { row: 7, col: 6 } }, // 3八
      { piece: PieceType.Gold, position: { row: 7, col: 5 } }, // 4八
      { piece: PieceType.Gold, position: { row: 7, col: 4 } }, // 5八
      { piece: PieceType.Silver, position: { row: 7, col: 7 } }, // 2八
    ],
  },
];

/**
 * 盤面が金無双の形かどうかを判定
 *
 * @param board - 盤面
 * @param player - 判定対象のプレイヤー
 * @returns 金無双の条件を満たせばtrue
 */
export function isKinmuso(board: Board, player: Player): boolean {
  return matchBoardConditions(board, kinmusoConditions, player);
}
