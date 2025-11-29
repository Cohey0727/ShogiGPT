import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";

/**
 * 早繰り銀の条件
 * 先手: 銀3六or4六
 * 後手: 銀7四or6四
 */
const hayakuriGinConditions: PieceConditionSet[] = [
  {
    type: "or",
    conditions: [
      { type: PieceType.Silver, position: { row: 5, col: 6 } }, // 3六
      { type: PieceType.Silver, position: { row: 5, col: 5 } }, // 4六
    ],
  },
];

/**
 * 盤面が早繰り銀の形かどうかを判定
 *
 * @param board - 盤面
 * @param player - 判定対象のプレイヤー
 * @returns 早繰り銀の条件を満たせばtrue
 */
export function isHayakuriGin(board: Board, player: Player): boolean {
  return matchBoardConditions(board, hayakuriGinConditions, player);
}
