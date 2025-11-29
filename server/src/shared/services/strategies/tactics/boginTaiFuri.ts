import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";

/**
 * 棒銀（対振り）の条件
 * 先手: 飛2八、銀2六or2五
 * 後手: 飛8二、銀8四or8五
 */
const boginTaiFuriConditions: PieceConditionSet[] = [
  {
    type: "and",
    conditions: [{ type: PieceType.Rook, position: { row: 7, col: 7 } }], // 2八
  },
  {
    type: "or",
    conditions: [
      { type: PieceType.Silver, position: { row: 5, col: 7 } }, // 2六
      { type: PieceType.Silver, position: { row: 4, col: 7 } }, // 2五
    ],
  },
];

/**
 * 盤面が棒銀（対振り）の形かどうかを判定
 *
 * @param board - 盤面
 * @param player - 判定対象のプレイヤー
 * @returns 棒銀（対振り）の条件を満たせばtrue
 */
export function isBoginTaiFuri(board: Board, player: Player): boolean {
  return matchBoardConditions(board, boginTaiFuriConditions, player);
}
