import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";

/**
 * 棒銀（相居飛車）の条件
 * 先手: 飛2八、銀2六or2五、歩2五or2四
 * 後手: 飛8二、銀8四or8五、歩8五or8六
 */
const boginAiIbishaConditions: PieceConditionSet[] = [
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
  {
    type: "or",
    conditions: [
      { type: PieceType.Pawn, position: { row: 4, col: 7 } }, // 2五
      { type: PieceType.Pawn, position: { row: 3, col: 7 } }, // 2四
    ],
  },
];

/**
 * 盤面が棒銀（相居飛車）の形かどうかを判定
 *
 * @param board - 盤面
 * @param player - 判定対象のプレイヤー
 * @returns 棒銀（相居飛車）の条件を満たせばtrue
 */
export function isBoginAiIbisha(board: Board, player: Player): boolean {
  return matchBoardConditions(board, boginAiIbishaConditions, player);
}
