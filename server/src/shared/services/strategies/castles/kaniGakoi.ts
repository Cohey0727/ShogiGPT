import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";

/**
 * カニ囲いの条件
 * 玉6九、金5八・7八、銀6八
 */
const kaniGakoiConditions: PieceConditionSet = {
  type: "and",
  conditions: [
    { piece: PieceType.King, position: { row: 8, col: 3 } }, // 6九
    { piece: PieceType.Gold, position: { row: 7, col: 4 } }, // 5八
    { piece: PieceType.Gold, position: { row: 7, col: 2 } }, // 7八
    { piece: PieceType.Silver, position: { row: 7, col: 3 } }, // 6八
  ],
};

/**
 * 局面がカニ囲いの形かどうかを判定
 *
 * @param board - 局面
 * @param player - 判定対象のプレイヤー
 * @returns カニ囲いの条件を満たせばtrue
 */
export function isKaniGakoi(board: Board, player: Player): boolean {
  return matchBoardConditions(board, kaniGakoiConditions, player);
}
