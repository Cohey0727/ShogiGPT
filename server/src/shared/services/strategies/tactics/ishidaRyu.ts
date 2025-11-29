import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";

/**
 * 石田流の条件
 * 先手: 飛7六、歩7五、桂7七
 * 後手: 飛3四、歩3五、桂3三
 */
const ishidaRyuConditions: PieceConditionSet[] = [
  {
    type: "and",
    conditions: [
      { type: PieceType.Rook, position: { row: 5, col: 2 } }, // 7六
      { type: PieceType.Pawn, position: { row: 4, col: 2 } }, // 7五
      { type: PieceType.Knight, position: { row: 6, col: 2 } }, // 7七
    ],
  },
];

/**
 * 盤面が石田流の形かどうかを判定
 *
 * @param board - 盤面
 * @param player - 判定対象のプレイヤー
 * @returns 石田流の条件を満たせばtrue
 */
export function isIshidaRyu(board: Board, player: Player): boolean {
  return matchBoardConditions(board, ishidaRyuConditions, player);
}
