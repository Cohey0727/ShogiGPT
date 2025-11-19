import type { Board, Player } from "../consts/shogi";
import { PieceType, pieceProperties } from "../consts/shogi";
import { applyUsiMove } from "./applyUsiMove";

/**
 * 指定した駒の位置をすべて取得
 */
function findPositions(
  board: Board,
  player: Player,
  pieceTypes: PieceType[]
): Array<{ row: number; col: number }> {
  const positions: Array<{ row: number; col: number }> = [];
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cell = board.cells[row][col];
      if (cell && cell.player === player && pieceTypes.includes(cell.type)) {
        positions.push({ row, col });
      }
    }
  }
  return positions;
}

/**
 * あるpositionから指定のdirectionに向かって開いている範囲の長さを取得
 */
function getLineOpenRange(
  board: Board,
  position: { row: number; col: number },
  direction: { row: number; col: number }
) {
  let row = position.row + direction.row;
  let col = position.col + direction.col;
  let length = 0;

  while (row >= 0 && row < 9 && col >= 0 && col < 9) {
    if (board.cells[row][col]) {
      break;
    }
    row += direction.row;
    col += direction.col;
    length++;
  }

  return length;
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
      if (
        (player === "SENTE" && rowDiff <= 0) ||
        (player === "GOTE" && rowDiff >= 0)
      )
        return false;
      // 間に駒がないかチェック
      const lanceStep = rowDiff > 0 ? 1 : -1;
      for (let r = fromRow + lanceStep; r !== toRow; r += lanceStep) {
        if (board.cells[r][fromCol]) return false;
      }
      return true;
    }

    case PieceType.Knight:
      return Math.abs(colDiff) === 1 && rowDiff === 2 * direction;

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
  const kingPositions = findPositions(board, player, [PieceType.King]);
  if (kingPositions.length === 0) return false;

  const kingPos = kingPositions[0];
  const opponent = player === "SENTE" ? "GOTE" : "SENTE";
  return isPositionUnderAttack(board, kingPos.row, kingPos.col, opponent);
}

/**
 * 詰みかどうかをチェック（簡易版：玉が逃げられる場所があるかのみチェック）
 */
function isCheckmate(board: Board, player: Player): boolean {
  // まず王手されているかチェック
  if (!isInCheck(board, player)) return false;

  const kingPositions = findPositions(board, player, [PieceType.King]);
  if (kingPositions.length === 0) return false;

  const kingPos = kingPositions[0];
  const opponent = player === "SENTE" ? "GOTE" : "SENTE";

  // 玉が移動できる8方向をチェック
  const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
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
 * USI形式の指し手情報
 */
interface MoveInfo {
  /** 移動元の位置（駒打ちの場合はundefined） */
  from?: { row: number; col: number };
  /** 移動先の位置 */
  to: { row: number; col: number };
}

/**
 * USI形式の指し手から移動元・移動先を取得
 */
function parseUsiMove(usiMove: string): MoveInfo {
  if (usiMove.includes("*")) {
    // 駒打ち
    const toPos = usiMove.split("*")[1].substring(0, 2);
    const file = parseInt(toPos[0], 10);
    const rank = toPos[1];
    return {
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
  moveInfo: MoveInfo,
  opponentPlayer: Player
): string | undefined {
  // 駒を取る
  if (moveInfo.from) {
    const targetCell = board.cells[moveInfo.to.row][moveInfo.to.col];
    if (targetCell && targetCell.player === opponentPlayer) {
      return pieceProperties[targetCell.type].name;
    }
  }

  return undefined;
}

/**
 * 角道の変化を分析
 * @param board 移動前の盤面
 * @param usiMove USI形式の指し手
 * @param isSente 自分が先手かどうか
 */
function analyzeBishopLine(
  board: Board,
  usiMove: string,
  isSente: boolean
): string[] {
  const results: string[] = [];

  const moveInfo = parseUsiMove(usiMove);
  const boardAfter = applyUsiMove(board, usiMove);
  const currentPlayer = board.turn;
  const opponentPlayer = currentPlayer === "SENTE" ? "GOTE" : "SENTE";
  const selfPlayer = isSente ? "SENTE" : "GOTE";
  const isSelfMove = currentPlayer === selfPlayer;

  const directions = [
    { row: -1, col: -1 },
    { row: -1, col: 1 },
    { row: 1, col: -1 },
    { row: 1, col: 1 },
  ];

  // 自分の角道
  const positions = findPositions(board, currentPlayer, [
    PieceType.Bishop,
    PieceType.PromotedBishop,
  ]);
  positions.forEach((position) => {
    const isMovingBishop =
      moveInfo.from?.row === position.row &&
      moveInfo.from?.col === position.col;
    if (isMovingBishop) {
      return;
    }

    for (const direction of directions) {
      const wasOnLine = moveInfo.from
        ? isPathClearAndOnLine(board, position, moveInfo.from, direction)
        : false;

      const isOnLine = isPathClearAndOnLine(
        boardAfter,
        position,
        moveInfo.to,
        direction
      );
      if (!wasOnLine && !isOnLine) {
        // 角道上に関係のない移動の場合はスキップ
        continue;
      }

      if (wasOnLine && isOnLine) {
        if (isSelfMove) {
          results.push("角道を伸ばす");
        }
        continue;
      }

      const rangeBefore = getLineOpenRange(board, position, direction);
      const rangeAfter = getLineOpenRange(boardAfter, position, direction);

      if (isOnLine) {
        results.push(isSelfMove ? "角道を閉じてしまう" : "角道を塞がれる");
      } else {
        if (rangeAfter - rangeBefore >= 2) {
          results.push(isSelfMove ? "角道を空ける" : "角道を開けてくれる");
        }
      }
    }
  });

  // 相手の角道
  const opponentPositions = findPositions(board, opponentPlayer, [
    PieceType.Bishop,
    PieceType.PromotedBishop,
  ]);
  opponentPositions.forEach((position) => {
    const isMovingBishop =
      moveInfo.from?.row === position.row &&
      moveInfo.from?.col === position.col;
    if (isMovingBishop) {
      return;
    }

    for (const direction of directions) {
      const wasOnLine = moveInfo.from
        ? isPathClearAndOnLine(board, position, moveInfo.from, direction)
        : false;

      const isOnLine = isPathClearAndOnLine(
        boardAfter,
        position,
        moveInfo.to,
        direction
      );
      if (!wasOnLine && !isOnLine) {
        // 角道上に関係のない移動の場合はスキップ
        continue;
      }

      if (wasOnLine && isOnLine) {
        if (!isSelfMove) {
          results.push("角道を伸ばしてくる");
        }
        continue;
      }

      const rangeBefore = getLineOpenRange(board, position, direction);
      const rangeAfter = getLineOpenRange(boardAfter, position, direction);

      if (isOnLine) {
        if (isSelfMove) {
          results.push("角道を塞ぐ");
        }
      } else {
        if (rangeAfter - rangeBefore >= 2) {
          results.push(
            isSelfMove ? "角道を開けさせられる" : "角道を開けてくる"
          );
        }
      }
    }
  });

  return results;
}

/**
 * 飛車道の変化を分析
 * @param board 移動前の盤面
 * @param usiMove USI形式の指し手
 * @param isSente 自分が先手かどうか
 */
function analyzeRookLine(
  board: Board,
  usiMove: string,
  isSente: boolean
): string[] {
  const results: string[] = [];

  const moveInfo = parseUsiMove(usiMove);
  const boardAfter = applyUsiMove(board, usiMove);
  const currentPlayer = board.turn;
  const opponentPlayer = currentPlayer === "SENTE" ? "GOTE" : "SENTE";
  const selfPlayer = isSente ? "SENTE" : "GOTE";
  const isSelfMove = currentPlayer === selfPlayer;

  const directions = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
  ];

  // 自分の飛車道
  const positions = findPositions(board, currentPlayer, [
    PieceType.Rook,
    PieceType.PromotedRook,
  ]);

  positions.forEach((position) => {
    const isMovingRook =
      moveInfo.from?.row === position.row &&
      moveInfo.from?.col === position.col;

    if (isMovingRook) {
      return;
    }

    for (const direction of directions) {
      const wasOnLine = moveInfo.from
        ? isPathClearAndOnLine(board, position, moveInfo.from, direction)
        : false;

      const isOnLine = isPathClearAndOnLine(
        boardAfter,
        position,
        moveInfo.to,
        direction
      );

      console.log({ position, isMovingRook, direction, isOnLine, wasOnLine });

      if (!wasOnLine && !isOnLine) {
        // 飛車道上に関係のない移動の場合はスキップ
        continue;
      }

      if (wasOnLine && isOnLine) {
        if (isSelfMove) results.push("飛車道を伸ばす");
        continue;
      }

      const rangeBefore = getLineOpenRange(board, position, direction);
      const rangeAfter = getLineOpenRange(boardAfter, position, direction);

      if (isOnLine) {
        results.push(isSelfMove ? "飛車道を閉じてしまう" : "飛車道を塞がれる");
      } else {
        if (rangeAfter - rangeBefore >= 2) {
          results.push(isSelfMove ? "飛車道を空ける" : "飛車道を開けてくれる");
        }
      }
    }
  });

  // 相手の飛車道
  const opponentPositions = findPositions(board, opponentPlayer, [
    PieceType.Rook,
    PieceType.PromotedRook,
  ]);
  opponentPositions.forEach((position) => {
    const isMovingRook =
      moveInfo.from?.row === position.row &&
      moveInfo.from?.col === position.col;
    if (isMovingRook) {
      return;
    }

    for (const direction of directions) {
      const wasOnLine = moveInfo.from
        ? isPathClearAndOnLine(board, position, moveInfo.from, direction)
        : false;

      const isOnLine = isPathClearAndOnLine(
        boardAfter,
        position,
        moveInfo.to,
        direction
      );

      if (!wasOnLine && !isOnLine) {
        // 飛車道上に関係のない移動の場合はスキップ
        continue;
      }

      if (wasOnLine && isOnLine) {
        if (!isSelfMove) {
          results.push("飛車道を伸ばしてくる");
        }
        continue;
      }

      const rangeBefore = getLineOpenRange(board, position, direction);
      const rangeAfter = getLineOpenRange(boardAfter, position, direction);

      if (isOnLine) {
        if (isSelfMove) {
          results.push("飛車道を塞ぐ");
        }
      } else {
        if (rangeAfter - rangeBefore >= 2) {
          results.push(
            isSelfMove ? "飛車道を開けさせられる" : "飛車道を開けてくる"
          );
        }
      }
    }
  });

  return results;
}

/**
 * あるマスから指定の方向に向かって目的地までのマスがすべて空いているかチェック
 * @return 目的地までの道が空いていればtrue、途中に駒があればfalse、目的地に到達しなければfalse
 */
function isPathClearAndOnLine(
  board: Board,
  origin: { row: number; col: number },
  destination: { row: number; col: number },
  direction: { row: number; col: number }
) {
  let row = origin.row + direction.row;
  let col = origin.col + direction.col;

  while (row >= 0 && row < 9 && col >= 0 && col < 9) {
    if (row === destination.row && col === destination.col) {
      return true;
    }
    if (board.cells[row][col]) {
      // 途中に駒がある場合は、
      return false;
    }

    row += direction.row;
    col += direction.col;
  }
  return false;
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
      if (moveInfo.from) {
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
  const isSente = isSelfMove
    ? currentPlayer === "SENTE"
    : opponentPlayer === "SENTE";

  const features: string[] = [];

  try {
    const moveInfo = parseUsiMove(usiMove);

    // 駒の取り合い分析
    const capturedPiece = analyzeCapture(board, moveInfo, opponentPlayer);
    if (capturedPiece) {
      features.push(`${capturedPiece}を取る`);
    }

    // 角道の変化分析
    features.push(...analyzeBishopLine(board, usiMove, isSente));

    // 飛車道の変化分析
    features.push(...analyzeRookLine(board, usiMove, isSente));
  } catch (error) {
    console.error("Failed to analyze move features:", error);
  }

  return features;
}
