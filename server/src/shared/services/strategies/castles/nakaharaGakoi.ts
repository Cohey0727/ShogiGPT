import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";

/**
 * 中原囲いの条件
 * 玉4八、金5八・3八
 */
const nakaharaGakoiConditions: PieceConditionSet = {
  type: "and",
  conditions: [
    { piece: PieceType.King, position: { row: 7, col: 5 } }, // 4八
    { piece: PieceType.Gold, position: { row: 7, col: 4 } }, // 5八
    { piece: PieceType.Gold, position: { row: 7, col: 6 } }, // 3八
  ],
};

/**
 * 盤面が中原囲いの形かどうかを判定
 *
 * @param board - 盤面
 * @param player - 判定対象のプレイヤー
 * @returns 中原囲いの条件を満たせばtrue
 */
export function isNakaharaGakoi(board: Board, player: Player): boolean {
  return matchBoardConditions(board, nakaharaGakoiConditions, player);
}
