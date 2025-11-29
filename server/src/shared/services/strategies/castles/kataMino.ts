import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";

/**
 * 片美濃の条件
 * 玉2八、金3八、銀4九
 */
const kataMinoConditions: PieceConditionSet = {
  type: "and",
  conditions: [
    { piece: PieceType.King, position: { row: 7, col: 7 } }, // 2八
    { piece: PieceType.Gold, position: { row: 7, col: 6 } }, // 3八
    { piece: PieceType.Silver, position: { row: 8, col: 5 } }, // 4九
  ],
};

/**
 * 盤面が片美濃の形かどうかを判定
 *
 * @param board - 盤面
 * @param player - 判定対象のプレイヤー
 * @returns 片美濃の条件を満たせばtrue
 */
export function isKataMino(board: Board, player: Player): boolean {
  return matchBoardConditions(board, kataMinoConditions, player);
}
