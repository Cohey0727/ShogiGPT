import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";

/**
 * ボナンザ囲いの条件
 * 玉7九、金6八・7八
 */
const bonanzaGakoiConditions: PieceConditionSet = {
  type: "and",
  conditions: [
    { piece: PieceType.King, position: { row: 8, col: 2 } }, // 7九
    { piece: PieceType.Gold, position: { row: 7, col: 3 } }, // 6八
    { piece: PieceType.Gold, position: { row: 7, col: 2 } }, // 7八
  ],
};

/**
 * 盤面がボナンザ囲いの形かどうかを判定
 *
 * @param board - 盤面
 * @param player - 判定対象のプレイヤー
 * @returns ボナンザ囲いの条件を満たせばtrue
 */
export function isBonanzaGakoi(board: Board, player: Player): boolean {
  return matchBoardConditions(board, bonanzaGakoiConditions, player);
}
