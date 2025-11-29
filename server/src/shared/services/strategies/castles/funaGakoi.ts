import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";

/**
 * 舟囲いの条件
 * 飛2八、玉7八、金5八・6九、銀7九、角8八
 */
const funaGakoiConditions: PieceConditionSet[] = [
  {
    type: "and",
    conditions: [
      { piece: PieceType.Rook, position: { row: 7, col: 7 } }, // 2八
      { piece: PieceType.King, position: { row: 7, col: 2 } }, // 7八
      { piece: PieceType.Gold, position: { row: 7, col: 4 } }, // 5八
      { piece: PieceType.Gold, position: { row: 8, col: 3 } }, // 6九
      { piece: PieceType.Silver, position: { row: 8, col: 2 } }, // 7九
      { piece: PieceType.Bishop, position: { row: 7, col: 1 } }, // 8八
    ],
  },
];

/**
 * 盤面が舟囲いの形かどうかを判定
 *
 * @param board - 盤面
 * @param player - 判定対象のプレイヤー
 * @returns 舟囲いの条件を満たせばtrue
 */
export function isFunaGakoi(board: Board, player: Player): boolean {
  return matchBoardConditions(board, funaGakoiConditions, player);
}
