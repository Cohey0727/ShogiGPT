import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";

/**
 * ゴキゲン中飛車の条件
 * 先手: 飛5八、歩5五、角7七
 * 後手: 飛5二、歩5五、角3三
 */
const gokigenNakabishaConditions: PieceConditionSet[] = [
  {
    type: "and",
    conditions: [
      { type: PieceType.Rook, position: { row: 7, col: 4 } }, // 5八
      { type: PieceType.Pawn, position: { row: 4, col: 4 } }, // 5五
      { type: PieceType.Bishop, position: { row: 6, col: 2 } }, // 7七
    ],
  },
];

/**
 * 盤面がゴキゲン中飛車の形かどうかを判定
 *
 * @param board - 盤面
 * @param player - 判定対象のプレイヤー
 * @returns ゴキゲン中飛車の条件を満たせばtrue
 */
export function isGokigenNakabisha(board: Board, player: Player): boolean {
  return matchBoardConditions(board, gokigenNakabishaConditions, player);
}
