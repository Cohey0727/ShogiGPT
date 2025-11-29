import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";

/**
 * 銀冠穴熊の条件
 * 飛2八、玉9九、金7九・6八、銀8八・7七、香9八
 */
const ginkanmuriAnagumaConditions: PieceConditionSet[] = [
  {
    type: "and",
    conditions: [
      { piece: PieceType.Rook, position: { row: 7, col: 7 } }, // 2八
      { piece: PieceType.King, position: { row: 8, col: 0 } }, // 9九
      { piece: PieceType.Gold, position: { row: 8, col: 2 } }, // 7九
      { piece: PieceType.Gold, position: { row: 7, col: 3 } }, // 6八
      { piece: PieceType.Silver, position: { row: 7, col: 1 } }, // 8八
      { piece: PieceType.Silver, position: { row: 6, col: 2 } }, // 7七
      { piece: PieceType.Lance, position: { row: 7, col: 0 } }, // 9八
    ],
  },
];

/**
 * 盤面が銀冠穴熊の形かどうかを判定
 *
 * @param board - 盤面
 * @param player - 判定対象のプレイヤー
 * @returns 銀冠穴熊の条件を満たせばtrue
 */
export function isGinkanmuriAnaguma(board: Board, player: Player): boolean {
  return matchBoardConditions(board, ginkanmuriAnagumaConditions, player);
}
