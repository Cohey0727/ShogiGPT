import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";

/**
 * 金矢倉の条件
 * 玉8八、金7八・6七、銀7七
 */
const kinYaguraConditions: PieceConditionSet = {
  type: "and",
  conditions: [
    { piece: PieceType.King, position: { row: 7, col: 1 } }, // 8八
    { piece: PieceType.Gold, position: { row: 7, col: 2 } }, // 7八
    { piece: PieceType.Gold, position: { row: 6, col: 3 } }, // 6七
    { piece: PieceType.Silver, position: { row: 6, col: 2 } }, // 7七
  ],
};

/**
 * 盤面が金矢倉の形かどうかを判定
 *
 * @param board - 盤面
 * @param player - 判定対象のプレイヤー
 * @returns 金矢倉の条件を満たせばtrue
 */
export function isKinYagura(board: Board, player: Player): boolean {
  return matchBoardConditions(board, kinYaguraConditions, player);
}
