import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";

/**
 * 右玉の条件
 * 飛2八、玉2八、金3八、銀4八
 *
 * 注: README.mdでは飛2八、玉2八となっているが、
 * 飛と玉が同じ2八にいることは不可能なので、飛の条件は省略
 */
const migigyokuConditions: PieceConditionSet = {
  type: "and",
  conditions: [
    { piece: PieceType.King, position: { row: 7, col: 7 } }, // 2八
    { piece: PieceType.Gold, position: { row: 7, col: 6 } }, // 3八
    { piece: PieceType.Silver, position: { row: 7, col: 5 } }, // 4八
  ],
};

/**
 * 盤面が右玉の形かどうかを判定
 *
 * @param board - 盤面
 * @param player - 判定対象のプレイヤー
 * @returns 右玉の条件を満たせばtrue
 */
export function isMigigyoku(board: Board, player: Player): boolean {
  return matchBoardConditions(board, migigyokuConditions, player);
}
