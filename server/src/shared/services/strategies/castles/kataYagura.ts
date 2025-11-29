import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";

/**
 * 片矢倉（天野矢倉）の条件
 * 玉7八、金6七・6八、銀7七
 */
const kataYaguraConditions: PieceConditionSet = {
  type: "and",
  conditions: [
    { piece: PieceType.King, position: { row: 7, col: 2 } }, // 7八
    { piece: PieceType.Gold, position: { row: 6, col: 3 } }, // 6七
    { piece: PieceType.Gold, position: { row: 7, col: 3 } }, // 6八
    { piece: PieceType.Silver, position: { row: 6, col: 2 } }, // 7七
  ],
};

/**
 * 盤面が片矢倉（天野矢倉）の形かどうかを判定
 *
 * @param board - 盤面
 * @param player - 判定対象のプレイヤー
 * @returns 片矢倉の条件を満たせばtrue
 */
export function isKataYagura(board: Board, player: Player): boolean {
  return matchBoardConditions(board, kataYaguraConditions, player);
}
