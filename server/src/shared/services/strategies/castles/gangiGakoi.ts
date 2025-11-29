import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";

/**
 * 雁木囲いの条件
 * 玉6九or7九、金5八・7八、銀4七・6七
 */
const gangiGakoiConditions: PieceConditionSet[] = [
  {
    type: "or",
    conditions: [
      { type: PieceType.King, position: { row: 8, col: 3 } }, // 6九
      { type: PieceType.King, position: { row: 8, col: 2 } }, // 7九
    ],
  },
  {
    type: "and",
    conditions: [
      { type: PieceType.Gold, position: { row: 7, col: 4 } }, // 5八
      { type: PieceType.Gold, position: { row: 7, col: 2 } }, // 7八
      { type: PieceType.Silver, position: { row: 6, col: 5 } }, // 4七
      { type: PieceType.Silver, position: { row: 6, col: 3 } }, // 6七
    ],
  },
];

/**
 * 盤面が雁木囲いの形かどうかを判定
 *
 * @param board - 盤面
 * @param player - 判定対象のプレイヤー
 * @returns 雁木囲いの条件を満たせばtrue
 */
export function isGangiGakoi(board: Board, player: Player): boolean {
  return matchBoardConditions(board, gangiGakoiConditions, player);
}
