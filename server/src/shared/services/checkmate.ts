import type { Board, Player, PieceType, Position, BoardIndex } from "../consts";
import { getPossibleMoves } from "./possibleMoves";
import { getDropPositions } from "./dropPiece";

/**
 * 指定されたプレイヤーの玉の位置を取得
 */
function findKingPosition(board: Board, player: Player): Position | null {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board.cells[row][col];
      if (piece && piece.player === player && piece.type === "king") {
        return {
          row: row as BoardIndex,
          col: col as BoardIndex,
        };
      }
    }
  }
  return null;
}

/**
 * 指定された位置が相手の駒に攻撃されているかチェック
 */
function isPositionUnderAttack(board: Board, position: Position, attackingPlayer: Player): boolean {
  // 相手の全ての駒について、この位置に移動可能かチェック
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board.cells[row][col];
      if (piece && piece.player === attackingPlayer) {
        const from: Position = {
          row: row as BoardIndex,
          col: col as BoardIndex,
        };
        const moves = getPossibleMoves(board, from);
        if (moves.some((move) => move.row === position.row && move.col === position.col)) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * 王手状態かどうかをチェック
 */
export function isInCheck(board: Board, player: Player): boolean {
  const kingPos = findKingPosition(board, player);
  if (!kingPos) return false;

  const opponent = player === "SENTE" ? "GOTE" : "SENTE";
  return isPositionUnderAttack(board, kingPos, opponent);
}

/**
 * 移動後の盤面をシミュレート（実際には移動しない）
 */
function simulateMove(board: Board, from: Position, to: Position): Board {
  // 盤面のディープコピー
  const newBoard: Board = {
    ...board,
    cells: board.cells.map((row) => [...row]),
    senteHands: [...board.senteHands],
    goteHands: [...board.goteHands],
  };

  const piece = newBoard.cells[from.row][from.col];
  const capturedPiece = newBoard.cells[to.row][to.col];

  // 駒を取る場合、持ち駒に追加
  if (capturedPiece && piece) {
    const capturedArray = piece.player === "SENTE" ? newBoard.senteHands : newBoard.goteHands;
    capturedArray.push(capturedPiece.type);
  }

  newBoard.cells[to.row][to.col] = piece;
  newBoard.cells[from.row][from.col] = null;

  return newBoard;
}

/**
 * 持ち駒を打った後の盤面をシミュレート
 */
function simulateDrop(
  board: Board,
  pieceType: PieceType,
  position: Position,
  player: Player,
): Board {
  const newBoard: Board = {
    ...board,
    cells: board.cells.map((row) => [...row]),
    senteHands: [...board.senteHands],
    goteHands: [...board.goteHands],
  };

  // 持ち駒から削除
  const capturedArray = player === "SENTE" ? newBoard.senteHands : newBoard.goteHands;
  const index = capturedArray.indexOf(pieceType);
  if (index > -1) {
    capturedArray.splice(index, 1);
  }

  // 盤面に配置
  newBoard.cells[position.row][position.col] = {
    type: pieceType,
    player: player,
  };

  return newBoard;
}

/**
 * 詰み判定: 指定されたプレイヤーが詰んでいるかどうかを判定する
 * @param board 盤面
 * @param player 判定対象のプレイヤー
 * @returns 詰んでいる場合true
 */
export function isCheckmate(board: Board, player: Player): boolean {
  // 王手状態でなければ詰みではない
  if (!isInCheck(board, player)) {
    return false;
  }

  // 盤上の全ての駒について、王手を回避できる移動があるかチェック
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board.cells[row][col];
      if (piece && piece.player === player) {
        const from: Position = {
          row: row as BoardIndex,
          col: col as BoardIndex,
        };
        const possibleMoves = getPossibleMoves(board, from);

        // 各移動先について、移動後に王手が解消されるかチェック
        for (const to of possibleMoves) {
          const newBoard = simulateMove(board, from, to);
          if (!isInCheck(newBoard, player)) {
            return false; // 王手を回避できる手がある
          }
        }
      }
    }
  }

  // 持ち駒を打って王手を回避できるかチェック
  const capturedPieces = player === "SENTE" ? board.senteHands : board.goteHands;

  if (capturedPieces.length > 0) {
    const uniquePieceTypes = new Set<PieceType>(capturedPieces);
    for (const pieceType of uniquePieceTypes) {
      const droppablePositions = getDropPositions(board, pieceType, player);

      // 各配置位置について、配置後に王手が解消されるかチェック
      for (const position of droppablePositions) {
        const newBoard = simulateDrop(board, pieceType, position, player);
        if (!isInCheck(newBoard, player)) {
          return false; // 王手を回避できる
        }
      }
    }
  }

  // 王手を回避する手が一つもない場合は詰み
  return true;
}

/**
 * ゲームオーバー判定と勝者の取得
 * @param board 盤面
 * @returns ゲームオーバーの場合は勝者、そうでない場合はnull
 */
export function getWinner(board: Board): Player | null {
  // 現在の手番のプレイヤーが詰んでいるかチェック
  if (isCheckmate(board, board.turn)) {
    // 詰んでいる場合、相手が勝者
    return board.turn === "SENTE" ? "GOTE" : "SENTE";
  }
  return null;
}
