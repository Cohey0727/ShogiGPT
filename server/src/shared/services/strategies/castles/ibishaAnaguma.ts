import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";

/**
 * 居飛車穴熊の条件
 * 飛2八、玉9九、金7八・7九、銀8八、香9八
 */
const ibishaAnagumaConditions: PieceConditionSet[] = [
  {
    type: "and",
    conditions: [
      { type: PieceType.Rook, position: { row: 7, col: 7 } }, // 2八
      { type: PieceType.King, position: { row: 8, col: 0 } }, // 9九
      { type: PieceType.Gold, position: { row: 7, col: 2 } }, // 7八
      { type: PieceType.Gold, position: { row: 8, col: 2 } }, // 7九
      { type: PieceType.Silver, position: { row: 7, col: 1 } }, // 8八
      { type: PieceType.Lance, position: { row: 7, col: 0 } }, // 9八
    ],
  },
];

/**
 * 盤面が居飛車穴熊の形かどうかを判定
 *
 * @param board - 盤面
 * @param player - 判定対象のプレイヤー
 * @returns 居飛車穴熊の条件を満たせばtrue
 */
export function isIbishaAnaguma(board: Board, player: Player): boolean {
  return matchBoardConditions(board, ibishaAnagumaConditions, player);
}
