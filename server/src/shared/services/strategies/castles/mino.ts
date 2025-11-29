import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";

/**
 * 美濃囲いの条件
 * 玉2八、金3八・5八
 */
const minoConditions: PieceConditionSet = {
  type: "and",
  conditions: [
    { piece: PieceType.King, position: { row: 7, col: 7 } }, // 2八
    { piece: PieceType.Gold, position: { row: 7, col: 6 } }, // 3八
    { piece: PieceType.Gold, position: { row: 7, col: 4 } }, // 5八
  ],
};

/**
 * 局面が美濃囲いの形かどうかを判定
 *
 * @param board - 局面
 * @param player - 判定対象のプレイヤー
 * @returns 美濃囲いの条件を満たせばtrue
 */
export function isMino(board: Board, player: Player): boolean {
  return matchBoardConditions(board, minoConditions, player);
}
