import type { Board, BoardIndex, Position } from "../consts";
import { Player, PieceType } from "../consts";
import { canDropAtPosition } from "./canDropAtPosition";
import { isCheckmate } from "./checkmate";

/**
 * 持ち駒を打てる位置を取得する
 *
 * @param board 盤面
 * @param pieceType 打とうとしている駒のタイプ
 * @param player プレイヤー
 * @returns 打てる位置の配列
 */
export function getDropPositions(
  board: Board,
  pieceType: PieceType,
  player: Player
): Position[] {
  const positions: Position[] = [];

  // 盤面全体をチェック
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      // 空いているマスのみ
      if (board.cells[row][col] === null) {
        // 最前線への配置禁止チェック
        if (!canDropAtPosition(pieceType, row, player)) {
          continue;
        }

        const position: Position = {
          row: row as BoardIndex,
          col: col as BoardIndex,
        };

        // 二歩チェック（歩を打つ場合）
        if (pieceType === PieceType.Pawn) {
          if (hasDoublesPawn(board, col, player)) {
            continue;
          }

          // 打ち歩詰めチェック
          if (isUchifuzume(board, position, player)) {
            continue;
          }
        }

        positions.push(position);
      }
    }
  }

  return positions;
}

/**
 * 指定した列に既に歩があるかチェック（二歩の禁則）
 *
 * @param board 盤面
 * @param col 列
 * @param player プレイヤー
 * @returns 既に歩がある場合はtrue
 */
function hasDoublesPawn(board: Board, col: number, player: Player): boolean {
  for (let row = 0; row < 9; row++) {
    const cell = board.cells[row][col];
    if (cell && cell.player === player && cell.type === PieceType.Pawn) {
      return true;
    }
  }
  return false;
}

/**
 * 打ち歩詰めかどうかをチェック
 *
 * @param board 盤面
 * @param position 歩を打とうとしている位置
 * @param player プレイヤー
 * @returns 打ち歩詰めの場合はtrue
 */
function isUchifuzume(
  board: Board,
  position: Position,
  player: Player
): boolean {
  // 歩を打った後の盤面をシミュレート
  const newBoard: Board = {
    ...board,
    cells: board.cells.map((row) => [...row]),
    senteHands: [...board.senteHands],
    goteHands: [...board.goteHands],
  };

  // 持ち駒から歩を削除
  const capturedArray =
    player === Player.Sente ? newBoard.senteHands : newBoard.goteHands;
  const index = capturedArray.indexOf(PieceType.Pawn);
  if (index > -1) {
    capturedArray.splice(index, 1);
  }

  // 盤面に歩を配置
  newBoard.cells[position.row][position.col] = {
    type: PieceType.Pawn,
    player: player,
  };

  // 相手が詰みになるかチェック
  const opponent = player === Player.Sente ? Player.Gote : Player.Sente;
  return isCheckmate(newBoard, opponent);
}
