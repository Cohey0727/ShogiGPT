import { PieceType, Player } from "../consts";
import type { Board, BoardIndex, Position } from "../consts";

/**
 * 移動方向（相対座標）
 */
interface Direction {
  row: number;
  col: number;
  /** この方向が遠距離移動可能か */
  isRanged: boolean;
}

/**
 * 駒の動ける方向を取得
 * @param pieceType 駒の種類
 * @param player プレイヤー（先手/後手）
 * @returns 移動可能な方向のリスト
 */
function getPieceDirections(pieceType: PieceType, player: Player): Direction[] {
  // 先手は上方向（row減少）、後手は下方向（row増加）が「前」
  const forward = player === Player.Sente ? -1 : 1;

  switch (pieceType) {
    case PieceType.King:
      // 王: 全方向1マス
      return [
        { row: -1, col: 0, isRanged: false }, // 上
        { row: -1, col: 1, isRanged: false }, // 右上
        { row: 0, col: 1, isRanged: false }, // 右
        { row: 1, col: 1, isRanged: false }, // 右下
        { row: 1, col: 0, isRanged: false }, // 下
        { row: 1, col: -1, isRanged: false }, // 左下
        { row: 0, col: -1, isRanged: false }, // 左
        { row: -1, col: -1, isRanged: false }, // 左上
      ];

    case PieceType.Rook:
      // 飛車: 縦横に遠距離
      return [
        { row: -1, col: 0, isRanged: true }, // 上
        { row: 1, col: 0, isRanged: true }, // 下
        { row: 0, col: 1, isRanged: true }, // 右
        { row: 0, col: -1, isRanged: true }, // 左
      ];

    case PieceType.PromotedRook:
      // 竜王: 飛車 + 斜め1マス
      return [
        { row: -1, col: 0, isRanged: true }, // 上（遠距離）
        { row: 1, col: 0, isRanged: true }, // 下（遠距離）
        { row: 0, col: 1, isRanged: true }, // 右（遠距離）
        { row: 0, col: -1, isRanged: true }, // 左（遠距離）
        { row: -1, col: 1, isRanged: false }, // 右上（1マスのみ）
        { row: 1, col: 1, isRanged: false }, // 右下（1マスのみ）
        { row: 1, col: -1, isRanged: false }, // 左下（1マスのみ）
        { row: -1, col: -1, isRanged: false }, // 左上（1マスのみ）
      ];

    case PieceType.Bishop:
      // 角: 斜めに遠距離
      return [
        { row: -1, col: 1, isRanged: true }, // 右上
        { row: 1, col: 1, isRanged: true }, // 右下
        { row: 1, col: -1, isRanged: true }, // 左下
        { row: -1, col: -1, isRanged: true }, // 左上
      ];

    case PieceType.PromotedBishop:
      // 竜馬: 角 + 縦横1マス
      return [
        { row: -1, col: 1, isRanged: true }, // 右上（遠距離）
        { row: 1, col: 1, isRanged: true }, // 右下（遠距離）
        { row: 1, col: -1, isRanged: true }, // 左下（遠距離）
        { row: -1, col: -1, isRanged: true }, // 左上（遠距離）
        { row: -1, col: 0, isRanged: false }, // 上（1マスのみ）
        { row: 1, col: 0, isRanged: false }, // 下（1マスのみ）
        { row: 0, col: 1, isRanged: false }, // 右（1マスのみ）
        { row: 0, col: -1, isRanged: false }, // 左（1マスのみ）
      ];

    case PieceType.Gold:
    case PieceType.PromotedSilver:
    case PieceType.PromotedKnight:
    case PieceType.PromotedLance:
    case PieceType.PromotedPawn:
      // 金、成銀、成桂、成香、と金: 前、斜め前、横、真後ろ
      return [
        { row: forward, col: 0, isRanged: false }, // 前
        { row: forward, col: 1, isRanged: false }, // 右前
        { row: forward, col: -1, isRanged: false }, // 左前
        { row: 0, col: 1, isRanged: false }, // 右
        { row: 0, col: -1, isRanged: false }, // 左
        { row: -forward, col: 0, isRanged: false }, // 真後ろ
      ];

    case PieceType.Silver:
      // 銀: 前3方向、斜め後ろ2方向
      return [
        { row: forward, col: 0, isRanged: false }, // 前
        { row: forward, col: 1, isRanged: false }, // 右前
        { row: forward, col: -1, isRanged: false }, // 左前
        { row: -forward, col: 1, isRanged: false }, // 右後ろ
        { row: -forward, col: -1, isRanged: false }, // 左後ろ
      ];

    case PieceType.Knight:
      // 桂馬: 前方2マス上がって左右
      return [
        { row: forward * 2, col: 1, isRanged: false }, // 右前
        { row: forward * 2, col: -1, isRanged: false }, // 左前
      ];

    case PieceType.Lance:
      // 香車: 前方に遠距離
      return [{ row: forward, col: 0, isRanged: true }];

    case PieceType.Pawn:
      // 歩: 前に1マス
      return [{ row: forward, col: 0, isRanged: false }];
    default:
      return [];
  }
}

/**
 * 位置が盤面内にあるかチェック
 */
function isInBoard(row: number, col: number): boolean {
  return row >= 0 && row <= 8 && col >= 0 && col <= 8;
}

/**
 * 指定位置から可能な移動先を取得
 * @param board 盤面
 * @param position 駒の位置
 * @returns 可能な移動先のリスト（空配列: 駒がない/動けない）
 */
export function getPossibleMoves(board: Board, position: Position): Position[] {
  const piece = board.cells[position.row][position.col];

  // 駒がない場合は空配列を返す
  if (!piece) {
    return [];
  }

  const directions = getPieceDirections(piece.type, piece.player);
  const possibleMoves: Position[] = [];

  for (const dir of directions) {
    let step = 1;
    while (true) {
      const newRow = position.row + dir.row * step;
      const newCol = position.col + dir.col * step;

      // 盤面外ならこの方向は終了
      if (!isInBoard(newRow, newCol)) {
        break;
      }

      const targetCell = board.cells[newRow][newCol];

      // 移動先に駒がある場合
      if (targetCell) {
        // 相手の駒なら取れる
        if (targetCell.player !== piece.player) {
          possibleMoves.push({
            row: newRow as BoardIndex,
            col: newCol as BoardIndex,
          });
        }
        // 味方の駒または相手の駒を取った後は、この方向は終了
        break;
      }

      // 空きマスなら移動可能
      possibleMoves.push({
        row: newRow as BoardIndex,
        col: newCol as BoardIndex,
      });

      // 遠距離移動でない場合は1マスで終了
      if (!dir.isRanged) {
        break;
      }

      step++;
    }
  }

  return possibleMoves;
}
