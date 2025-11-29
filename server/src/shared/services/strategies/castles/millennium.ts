import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";

/**
 * ミレニアムの条件
 * 飛2八、玉6八、金7八・7九、銀8八
 */
const millenniumConditions: PieceConditionSet = {
  type: "and",
  conditions: [
    { piece: PieceType.Rook, position: { row: 7, col: 7 } }, // 2八
    { piece: PieceType.King, position: { row: 7, col: 3 } }, // 6八
    { piece: PieceType.Gold, position: { row: 7, col: 2 } }, // 7八
    { piece: PieceType.Gold, position: { row: 8, col: 2 } }, // 7九
    { piece: PieceType.Silver, position: { row: 7, col: 1 } }, // 8八
  ],
};

/**
 * 盤面がミレニアムの形かどうかを判定
 *
 * @param board - 盤面
 * @param player - 判定対象のプレイヤー
 * @returns ミレニアムの条件を満たせばtrue
 */
export function isMillennium(board: Board, player: Player): boolean {
  return matchBoardConditions(board, millenniumConditions, player);
}
