import type { Board, Player } from "../consts/shogi";
import { PieceType, pieceProperties } from "../consts/shogi";
import { applyUsiMove } from "./applyUsiMove";

/**
 * 指定した駒の位置を取得
 */
function findPiece(
  board: Board,
  player: Player,
  pieceTypes: PieceType[]
): { row: number; col: number } | null {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cell = board.cells[row][col];
      if (cell && cell.player === player && pieceTypes.includes(cell.type)) {
        return { row, col };
      }
    }
  }
  return null;
}

/**
 * 角道が開いているかチェック（斜め方向に障害物がないか）
 */
function isBishopLineOpen(
  board: Board,
  fromRow: number,
  fromCol: number,
  dirRow: number,
  dirCol: number
): boolean {
  let row = fromRow + dirRow;
  let col = fromCol + dirCol;
  let foundPiece = false;

  while (row >= 0 && row < 9 && col >= 0 && col < 9) {
    if (board.cells[row][col]) {
      foundPiece = true;
      break;
    }
    row += dirRow;
    col += dirCol;
  }

  return !foundPiece;
}

/**
 * 飛車道が開いているかチェック（縦横方向に障害物がないか）
 */
function isRookLineOpen(
  board: Board,
  fromRow: number,
  fromCol: number,
  dirRow: number,
  dirCol: number
): boolean {
  let row = fromRow + dirRow;
  let col = fromCol + dirCol;
  let foundPiece = false;

  while (row >= 0 && row < 9 && col >= 0 && col < 9) {
    if (board.cells[row][col]) {
      foundPiece = true;
      break;
    }
    row += dirRow;
    col += dirCol;
  }

  return !foundPiece;
}


/**
 * 指定された位置が相手の駒に攻撃されているかチェック
 */
function isPositionUnderAttack(
  board: Board,
  row: number,
  col: number,
  attackingPlayer: Player
): boolean {
  // 全ての相手駒をチェックして、その駒が指定位置を攻撃できるか確認
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const piece = board.cells[r][c];
      if (!piece || piece.player !== attackingPlayer) continue;

      // 駒の種類に応じた移動可能範囲をチェック
      const canAttack = canPieceAttackPosition(
        piece.type,
        r,
        c,
        row,
        col,
        attackingPlayer,
        board
      );
      if (canAttack) return true;
    }
  }
  return false;
}

/**
 * 駒が指定位置を攻撃できるかチェック
 */
function canPieceAttackPosition(
  pieceType: PieceType,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  player: Player,
  board: Board
): boolean {
  const rowDiff = toRow - fromRow;
  const colDiff = toCol - fromCol;
  const direction = player === "SENTE" ? 1 : -1;

  switch (pieceType) {
    case PieceType.Pawn:
      return rowDiff === direction && colDiff === 0;

    case PieceType.Lance: {
      if (colDiff !== 0) return false;
      if ((player === "SENTE" && rowDiff <= 0) || (player === "GOTE" && rowDiff >= 0))
        return false;
      // 間に駒がないかチェック
      const lanceStep = rowDiff > 0 ? 1 : -1;
      for (let r = fromRow + lanceStep; r !== toRow; r += lanceStep) {
        if (board.cells[r][fromCol]) return false;
      }
      return true;
    }

    case PieceType.Knight:
      return (
        Math.abs(colDiff) === 1 &&
        rowDiff === 2 * direction
      );

    case PieceType.Silver:
      return (
        (Math.abs(colDiff) === 1 && rowDiff === direction) ||
        (Math.abs(colDiff) === 1 && Math.abs(rowDiff) === 1)
      );

    case PieceType.Gold:
    case PieceType.PromotedPawn:
    case PieceType.PromotedLance:
    case PieceType.PromotedKnight:
    case PieceType.PromotedSilver:
      return (
        (Math.abs(colDiff) <= 1 && rowDiff === direction) ||
        (colDiff === 0 && rowDiff === -direction) ||
        (Math.abs(colDiff) === 1 && rowDiff === 0)
      );

    case PieceType.Bishop: {
      if (Math.abs(rowDiff) !== Math.abs(colDiff)) return false;
      // 間に駒がないかチェック
      const bishopRowStep = rowDiff > 0 ? 1 : -1;
      const bishopColStep = colDiff > 0 ? 1 : -1;
      let r = fromRow + bishopRowStep;
      let c = fromCol + bishopColStep;
      while (r !== toRow && c !== toCol) {
        if (board.cells[r][c]) return false;
        r += bishopRowStep;
        c += bishopColStep;
      }
      return true;
    }

    case PieceType.Rook:
      if (rowDiff !== 0 && colDiff !== 0) return false;
      // 間に駒がないかチェック
      if (rowDiff !== 0) {
        const rookStep = rowDiff > 0 ? 1 : -1;
        for (let r = fromRow + rookStep; r !== toRow; r += rookStep) {
          if (board.cells[r][fromCol]) return false;
        }
      } else {
        const rookStep = colDiff > 0 ? 1 : -1;
        for (let c = fromCol + rookStep; c !== toCol; c += rookStep) {
          if (board.cells[fromRow][c]) return false;
        }
      }
      return true;

    case PieceType.PromotedBishop:
      // 馬は角の動き + 1マス縦横
      if (Math.abs(rowDiff) === Math.abs(colDiff)) {
        const bishopRowStep = rowDiff > 0 ? 1 : -1;
        const bishopColStep = colDiff > 0 ? 1 : -1;
        let r = fromRow + bishopRowStep;
        let c = fromCol + bishopColStep;
        while (r !== toRow && c !== toCol) {
          if (board.cells[r][c]) return false;
          r += bishopRowStep;
          c += bishopColStep;
        }
        return true;
      }
      return Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1;

    case PieceType.PromotedRook:
      // 竜は飛車の動き + 1マス斜め
      if (rowDiff === 0 || colDiff === 0) {
        if (rowDiff !== 0) {
          const rookStep = rowDiff > 0 ? 1 : -1;
          for (let r = fromRow + rookStep; r !== toRow; r += rookStep) {
            if (board.cells[r][fromCol]) return false;
          }
        } else {
          const rookStep = colDiff > 0 ? 1 : -1;
          for (let c = fromCol + rookStep; c !== toCol; c += rookStep) {
            if (board.cells[fromRow][c]) return false;
          }
        }
        return true;
      }
      return Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 1;

    case PieceType.King:
      return Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1;

    default:
      return false;
  }
}

/**
 * 指定されたプレイヤーが王手されているかチェック
 */
function isInCheck(board: Board, player: Player): boolean {
  const kingPos = findPiece(board, player, [PieceType.King]);
  if (!kingPos) return false;

  const opponent = player === "SENTE" ? "GOTE" : "SENTE";
  return isPositionUnderAttack(board, kingPos.row, kingPos.col, opponent);
}

/**
 * 詰みかどうかをチェック（簡易版：玉が逃げられる場所があるかのみチェック）
 */
function isCheckmate(board: Board, player: Player): boolean {
  // まず王手されているかチェック
  if (!isInCheck(board, player)) return false;

  const kingPos = findPiece(board, player, [PieceType.King]);
  if (!kingPos) return false;

  const opponent = player === "SENTE" ? "GOTE" : "SENTE";

  // 玉が移動できる8方向をチェック
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1],
  ];

  for (const [dRow, dCol] of directions) {
    const newRow = kingPos.row + dRow;
    const newCol = kingPos.col + dCol;

    // 盤面外はスキップ
    if (newRow < 0 || newRow >= 9 || newCol < 0 || newCol >= 9) continue;

    const targetCell = board.cells[newRow][newCol];

    // 自分の駒がある場所には移動できない
    if (targetCell && targetCell.player === player) continue;

    // この位置に移動した場合、攻撃されていないかチェック
    // 仮想的に玉を動かして判定
    const testBoard = JSON.parse(JSON.stringify(board)) as Board;
    testBoard.cells[newRow][newCol] = testBoard.cells[kingPos.row][kingPos.col];
    testBoard.cells[kingPos.row][kingPos.col] = null;

    if (!isPositionUnderAttack(testBoard, newRow, newCol, opponent)) {
      // 逃げられる場所がある
      return false;
    }
  }

  // 玉が逃げられない（簡易的な詰み判定）
  return true;
}

/**
 * USI形式の指し手から移動元・移動先を取得
 */
function parseUsiMove(usiMove: string): {
  isDrop: boolean;
  from?: { row: number; col: number };
  to: { row: number; col: number };
} {
  if (usiMove.includes("*")) {
    // 駒打ち
    const toPos = usiMove.split("*")[1].substring(0, 2);
    const file = parseInt(toPos[0], 10);
    const rank = toPos[1];
    return {
      isDrop: true,
      to: {
        col: 9 - file,
        row: rank.charCodeAt(0) - "a".charCodeAt(0),
      },
    };
  } else {
    // 通常の移動
    const moveStr = usiMove.replace("+", "");
    const fromFile = parseInt(moveStr[0], 10);
    const fromRank = moveStr[1];
    const toFile = parseInt(moveStr[2], 10);
    const toRank = moveStr[3];
    return {
      isDrop: false,
      from: {
        col: 9 - fromFile,
        row: fromRank.charCodeAt(0) - "a".charCodeAt(0),
      },
      to: {
        col: 9 - toFile,
        row: toRank.charCodeAt(0) - "a".charCodeAt(0),
      },
    };
  }
}

/**
 * 駒の取り合いを分析
 */
function analyzeCapture(
  board: Board,
  moveInfo: ReturnType<typeof parseUsiMove>,
  opponentPlayer: Player
): string | undefined {
  // 駒を取る
  if (!moveInfo.isDrop && moveInfo.to) {
    const targetCell = board.cells[moveInfo.to.row][moveInfo.to.col];
    if (targetCell && targetCell.player === opponentPlayer) {
      return pieceProperties[targetCell.type].name;
    }
  }

  return undefined;
}

/**
 * 角道の変化を分析
 */
function analyzeBishopLine(
  board: Board,
  boardAfter: Board,
  moveInfo: ReturnType<typeof parseUsiMove>,
  currentPlayer: Player,
  opponentPlayer: Player,
  isSelfMove: boolean
): string[] {
  const results: string[] = [];

  if (moveInfo.isDrop || !moveInfo.from) return results;

  // 自分の角道
  const myBishopPos = findPiece(board, currentPlayer, [
    PieceType.Bishop,
    PieceType.PromotedBishop,
  ]);
  if (myBishopPos) {
    const isMovingBishop =
      moveInfo.from.row === myBishopPos.row &&
      moveInfo.from.col === myBishopPos.col;

    if (!isMovingBishop) {
      const directions = [
        { dirRow: -1, dirCol: -1 },
        { dirRow: -1, dirCol: 1 },
        { dirRow: 1, dirCol: -1 },
        { dirRow: 1, dirCol: 1 },
      ];

      for (const { dirRow, dirCol } of directions) {
        const wasOpen = isBishopLineOpen(
          board,
          myBishopPos.row,
          myBishopPos.col,
          dirRow,
          dirCol
        );
        const isOpen = isBishopLineOpen(
          boardAfter,
          myBishopPos.row,
          myBishopPos.col,
          dirRow,
          dirCol
        );

        if (!wasOpen && isOpen) {
          results.push(isSelfMove ? "角道を開ける" : "角道を開けてくる");
          break;
        }
        if (wasOpen && !isOpen) {
          results.push(isSelfMove ? "角道を閉じさせられる" : "角道を閉じる");
          break;
        }
      }
    }
  }

  // 相手の角道
  const opponentBishopPos = findPiece(board, opponentPlayer, [
    PieceType.Bishop,
    PieceType.PromotedBishop,
  ]);
  if (opponentBishopPos) {
    const isMovingBishop =
      moveInfo.from.row === opponentBishopPos.row &&
      moveInfo.from.col === opponentBishopPos.col;

    if (!isMovingBishop) {
      const directions = [
        { dirRow: -1, dirCol: -1 },
        { dirRow: -1, dirCol: 1 },
        { dirRow: 1, dirCol: -1 },
        { dirRow: 1, dirCol: 1 },
      ];

      for (const { dirRow, dirCol } of directions) {
        const wasOpen = isBishopLineOpen(
          board,
          opponentBishopPos.row,
          opponentBishopPos.col,
          dirRow,
          dirCol
        );
        const isOpen = isBishopLineOpen(
          boardAfter,
          opponentBishopPos.row,
          opponentBishopPos.col,
          dirRow,
          dirCol
        );

        if (!wasOpen && isOpen && !isSelfMove) {
          results.push("角道を開ける");
          break;
        }
        if (wasOpen && !isOpen) {
          results.push(isSelfMove ? "相手の角道を閉じる" : "角道を閉じさせる");
          break;
        }
      }
    }
  }

  return results;
}

/**
 * 飛車道の変化を分析
 */
function analyzeRookLine(
  board: Board,
  boardAfter: Board,
  moveInfo: ReturnType<typeof parseUsiMove>,
  currentPlayer: Player,
  opponentPlayer: Player,
  isSelfMove: boolean
): string[] {
  const results: string[] = [];

  if (moveInfo.isDrop || !moveInfo.from) return results;

  // 自分の飛車道
  const myRookPos = findPiece(board, currentPlayer, [
    PieceType.Rook,
    PieceType.PromotedRook,
  ]);
  if (myRookPos) {
    const isMovingRook =
      moveInfo.from.row === myRookPos.row &&
      moveInfo.from.col === myRookPos.col;

    if (!isMovingRook) {
      const directions = [
        { dirRow: -1, dirCol: 0 },
        { dirRow: 1, dirCol: 0 },
        { dirRow: 0, dirCol: -1 },
        { dirRow: 0, dirCol: 1 },
      ];

      for (const { dirRow, dirCol } of directions) {
        const wasOpen = isRookLineOpen(
          board,
          myRookPos.row,
          myRookPos.col,
          dirRow,
          dirCol
        );
        const isOpen = isRookLineOpen(
          boardAfter,
          myRookPos.row,
          myRookPos.col,
          dirRow,
          dirCol
        );

        if (!wasOpen && isOpen) {
          results.push(isSelfMove ? "飛車道を開ける" : "飛車道を開けてくる");
          break;
        }
        if (wasOpen && !isOpen) {
          results.push(
            isSelfMove ? "飛車道を閉じさせられる" : "飛車道を閉じる"
          );
          break;
        }
      }
    }
  }

  // 相手の飛車道
  const opponentRookPos = findPiece(board, opponentPlayer, [
    PieceType.Rook,
    PieceType.PromotedRook,
  ]);
  if (opponentRookPos) {
    const isMovingRook =
      moveInfo.from.row === opponentRookPos.row &&
      moveInfo.from.col === opponentRookPos.col;

    if (!isMovingRook) {
      const directions = [
        { dirRow: -1, dirCol: 0 },
        { dirRow: 1, dirCol: 0 },
        { dirRow: 0, dirCol: -1 },
        { dirRow: 0, dirCol: 1 },
      ];

      for (const { dirRow, dirCol } of directions) {
        const wasOpen = isRookLineOpen(
          board,
          opponentRookPos.row,
          opponentRookPos.col,
          dirRow,
          dirCol
        );
        const isOpen = isRookLineOpen(
          boardAfter,
          opponentRookPos.row,
          opponentRookPos.col,
          dirRow,
          dirCol
        );

        if (!wasOpen && isOpen) {
          results.push(
            isSelfMove ? "相手の飛車道を開けさせる" : "飛車道を開ける"
          );
          break;
        }
        if (wasOpen && !isOpen) {
          results.push(
            isSelfMove ? "相手の飛車道を閉じる" : "飛車道を閉じさせる"
          );
          break;
        }
      }
    }
  }

  return results;
}

/**
 * 王手・詰み関連のタグを分析
 */
export function analyzeMateTags(board: Board, usiMove: string): string[] {
  const currentPlayer = board.turn;
  const opponentPlayer = currentPlayer === "SENTE" ? "GOTE" : "SENTE";
  const tags: string[] = [];

  try {
    const moveInfo = parseUsiMove(usiMove);

    // 手を指す前に王手されているかチェック
    const wasInCheck = isInCheck(board, currentPlayer);

    // 手を指した後の盤面
    const boardAfter = applyUsiMove(board, usiMove);

    // 手を指した後に王手されているかチェック
    const isStillInCheck = isInCheck(boardAfter, currentPlayer);

    // 被王手（手を指す前に王手されていた）
    if (wasInCheck) {
      tags.push("被王手");
    }

    // 王手をかわす・回避の判定
    if (wasInCheck && !isStillInCheck) {
      // 玉を動かしたかチェック
      if (!moveInfo.isDrop && moveInfo.from) {
        const movedPiece = board.cells[moveInfo.from.row][moveInfo.from.col];
        if (movedPiece?.type === PieceType.King) {
          tags.push("王手をかわす");
        } else {
          tags.push("王手を回避");
        }
      }
    }

    // 相手に王手をかけたかチェック
    const opponentInCheck = isInCheck(boardAfter, opponentPlayer);
    if (opponentInCheck) {
      tags.push("王手");
    }

    // 詰みの判定
    if (isCheckmate(boardAfter, opponentPlayer)) {
      tags.push("詰み");
    }
  } catch (error) {
    console.error("Failed to analyze mate tags:", error);
  }

  return tags;
}

/**
 * 指し手の戦術的特徴を分析
 * @param isSelfMove 自分の手かどうか（trueなら自分、falseなら相手）
 */
export function analyzeMoveTags(
  board: Board,
  usiMove: string,
  isSelfMove: boolean
): string[] {
  const currentPlayer = board.turn;
  const opponentPlayer = currentPlayer === "SENTE" ? "GOTE" : "SENTE";

  const features: string[] = [];

  try {
    const moveInfo = parseUsiMove(usiMove);
    const boardAfter = applyUsiMove(board, usiMove);

    // 駒の取り合い分析
    const capturedPiece = analyzeCapture(board, moveInfo, opponentPlayer);
    if (capturedPiece) {
      features.push(`${capturedPiece}を取る`);
    }

    // 角道の変化分析
    features.push(
      ...analyzeBishopLine(
        board,
        boardAfter,
        moveInfo,
        currentPlayer,
        opponentPlayer,
        isSelfMove
      )
    );

    // 飛車道の変化分析
    features.push(
      ...analyzeRookLine(
        board,
        boardAfter,
        moveInfo,
        currentPlayer,
        opponentPlayer,
        isSelfMove
      )
    );
  } catch (error) {
    console.error("Failed to analyze move features:", error);
  }

  return features;
}
