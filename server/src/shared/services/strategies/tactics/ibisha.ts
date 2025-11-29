import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";

/**
 * 居飛車の条件
 * 先手: 飛2八
 * 後手: 飛8二
 */
const ibishaConditions: PieceConditionSet[] = [
  {
    type: "and",
    conditions: [{ type: PieceType.Rook, position: { row: 7, col: 7 } }], // 2八
  },
];

/**
 * 盤面が居飛車の形かどうかを判定
 *
 * @param board - 盤面
 * @param player - 判定対象のプレイヤー
 * @returns 居飛車の条件を満たせばtrue
 */
export function isIbisha(board: Board, player: Player): boolean {
  return matchBoardConditions(board, ibishaConditions, player);
}
