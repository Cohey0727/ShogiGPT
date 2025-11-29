import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";

/**
 * 松尾流穴熊の条件
 * 飛2八、玉9九、金7九・8八、銀7八、香9八
 */
const matsuoAnagumaConditions: PieceConditionSet = {
  type: "and",
  conditions: [
    { piece: PieceType.Rook, position: { row: 7, col: 7 } }, // 2八
    { piece: PieceType.King, position: { row: 8, col: 0 } }, // 9九
    { piece: PieceType.Gold, position: { row: 8, col: 2 } }, // 7九
    { piece: PieceType.Gold, position: { row: 7, col: 1 } }, // 8八
    { piece: PieceType.Silver, position: { row: 7, col: 2 } }, // 7八
    { piece: PieceType.Lance, position: { row: 7, col: 0 } }, // 9八
  ],
};

/**
 * 局面が松尾流穴熊の形かどうかを判定
 *
 * @param board - 局面
 * @param player - 判定対象のプレイヤー
 * @returns 松尾流穴熊の条件を満たせばtrue
 */
export function isMatsuoAnaguma(board: Board, player: Player): boolean {
  return matchBoardConditions(board, matsuoAnagumaConditions, player);
}
