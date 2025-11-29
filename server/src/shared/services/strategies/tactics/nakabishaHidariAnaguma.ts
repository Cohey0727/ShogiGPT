import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";

/**
 * 中飛車左穴熊の条件
 * 先手: 飛5八、玉9九、金8八・7九、銀8八、香9八
 * 後手: 飛5二、玉1一、金2二・3一、銀2二、香1二
 */
const nakabishaHidariAnagumaConditions: PieceConditionSet[] = [
  {
    type: "and",
    conditions: [
      { type: PieceType.Rook, position: { row: 7, col: 4 } }, // 5八
      { type: PieceType.King, position: { row: 8, col: 0 } }, // 9九
      { type: PieceType.Gold, position: { row: 7, col: 1 } }, // 8八
      { type: PieceType.Gold, position: { row: 8, col: 2 } }, // 7九
      { type: PieceType.Silver, position: { row: 7, col: 1 } }, // 8八
      { type: PieceType.Lance, position: { row: 7, col: 0 } }, // 9八
    ],
  },
];

/**
 * 盤面が中飛車左穴熊の形かどうかを判定
 *
 * @param board - 盤面
 * @param player - 判定対象のプレイヤー
 * @returns 中飛車左穴熊の条件を満たせばtrue
 */
export function isNakabishaHidariAnaguma(
  board: Board,
  player: Player,
): boolean {
  return matchBoardConditions(board, nakabishaHidariAnagumaConditions, player);
}
