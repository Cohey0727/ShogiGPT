import type { Board, BoardIndex, Position } from "../consts";
import { PieceType, Player } from "../consts";
import { getPossibleMoves } from "./possibleMoves";
import { getDropPositions } from "./dropPiece";
import { isInCheck } from "./checkmate";

/**
 * 通常の移動が合法かどうかを判定
 */
function isLegalNormalMove(board: Board, usiMove: string): boolean {
  // 成りの有無を判定
  const isPromotion = usiMove.endsWith("+");
  const moveWithoutPromotion = isPromotion ? usiMove.slice(0, -1) : usiMove;

  if (moveWithoutPromotion.length !== 4) {
    return false;
  }

  const fromPos = moveWithoutPromotion.substring(0, 2);
  const toPos = moveWithoutPromotion.substring(2, 4);

  const fromPosition = parsePosition(fromPos);
  const toPosition = parsePosition(toPos);

  if (!fromPosition || !toPosition) {
    return false;
  }

  // 移動元に駒があるか確認
  const piece = board.cells[fromPosition.row][fromPosition.col];
  if (!piece) {
    return false;
  }

  // 駒が現在のプレイヤーのものか確認
  if (piece.player !== board.turn) {
    return false;
  }

  // 合法な移動先を取得
  const legalMoves = getPossibleMoves(board, fromPosition);

  // 指定位置が合法な移動先に含まれているか確認
  const isLegalDestination = legalMoves.some(
    (pos) => pos.row === toPosition.row && pos.col === toPosition.col
  );

  if (!isLegalDestination) {
    return false;
  }

  // 成りの検証
  if (isPromotion) {
    // 成れる駒かどうか
    if (!canBePromoted(piece.type)) {
      return false;
    }

    // 移動元または移動先が成りゾーンにあるか
    const fromInPromotionZone = isPromotionZone(fromPosition.row, board.turn);
    const toInPromotionZone = isPromotionZone(toPosition.row, board.turn);

    if (!fromInPromotionZone && !toInPromotionZone) {
      return false;
    }
  }

  // 移動後に自分の王が王手になっていないか確認
  const newBoard = simulateMove(board, fromPosition, toPosition, isPromotion);
  if (isInCheck(newBoard, board.turn)) {
    return false;
  }

  return true;
}

/**
 * USI形式の駒表記から駒の種類へのマッピング
 */
const usiPieceType: Record<string, PieceType> = {
  K: PieceType.King,
  R: PieceType.Rook,
  B: PieceType.Bishop,
  G: PieceType.Gold,
  S: PieceType.Silver,
  N: PieceType.Knight,
  L: PieceType.Lance,
  P: PieceType.Pawn,
};

/**
 * USI形式の座標（例: "7g"）を行・列のインデックスに変換
 */
function parsePosition(
  pos: string
): { row: BoardIndex; col: BoardIndex } | null {
  if (pos.length !== 2) {
    return null;
  }

  const file = parseInt(pos[0], 10); // 筋（1-9）
  const rank = pos[1]; // 段（a-i）

  // 筋の範囲チェック
  if (file < 1 || file > 9) {
    return null;
  }

  // 筋は1-9で、盤面の配列は0-8なので、9から引く（右から左）
  const col = 9 - file;

  // 段はa-iで、盤面の配列は0-8
  const rankMap: Record<string, BoardIndex> = {
    a: 0,
    b: 1,
    c: 2,
    d: 3,
    e: 4,
    f: 5,
    g: 6,
    h: 7,
    i: 8,
  };

  const row = rankMap[rank];

  if (row === undefined) {
    return null;
  }

  return { row, col: col as BoardIndex };
}

/**
 * 成れる駒かどうかを判定
 */
function canBePromoted(pieceType: PieceType): boolean {
  const promotablePieces: readonly PieceType[] = [
    PieceType.Pawn,
    PieceType.Lance,
    PieceType.Knight,
    PieceType.Silver,
    PieceType.Bishop,
    PieceType.Rook,
  ];
  return promotablePieces.includes(pieceType);
}

/**
 * 指定された行が、指定されたプレイヤーにとって成りゾーン（敵陣3段）かどうかを判定
 */
function isPromotionZone(row: number, player: Player): boolean {
  if (player === Player.Sente) {
    // 先手の敵陣は0-2行目
    return row >= 0 && row <= 2;
  } else {
    // 後手の敵陣は6-8行目
    return row >= 6 && row <= 8;
  }
}

/**
 * 移動後の盤面をシミュレート
 */
function simulateMove(
  board: Board,
  from: Position,
  to: Position,
  promote: boolean
): Board {
  // 盤面のディープコピー
  const newBoard: Board = {
    ...board,
    cells: board.cells.map((row) => [...row]),
    senteHands: [...board.senteHands],
    goteHands: [...board.goteHands],
    turn: board.turn,
  };

  const piece = newBoard.cells[from.row][from.col];
  const capturedPiece = newBoard.cells[to.row][to.col];

  if (!piece) {
    return newBoard;
  }

  // 駒を取る場合、持ち駒に追加（成り駒は元に戻す）
  if (capturedPiece) {
    let capturedPieceType = capturedPiece.type;

    // 成り駒を元に戻す
    const demotionMap: Record<PieceType, PieceType> = {
      [PieceType.PromotedPawn]: PieceType.Pawn,
      [PieceType.PromotedLance]: PieceType.Lance,
      [PieceType.PromotedKnight]: PieceType.Knight,
      [PieceType.PromotedSilver]: PieceType.Silver,
      [PieceType.PromotedBishop]: PieceType.Bishop,
      [PieceType.PromotedRook]: PieceType.Rook,
      [PieceType.Pawn]: PieceType.Pawn,
      [PieceType.Lance]: PieceType.Lance,
      [PieceType.Knight]: PieceType.Knight,
      [PieceType.Silver]: PieceType.Silver,
      [PieceType.Bishop]: PieceType.Bishop,
      [PieceType.Rook]: PieceType.Rook,
      [PieceType.Gold]: PieceType.Gold,
      [PieceType.King]: PieceType.King,
    };

    capturedPieceType = demotionMap[capturedPieceType] ?? capturedPieceType;

    const capturedArray =
      piece.player === Player.Sente ? newBoard.senteHands : newBoard.goteHands;
    capturedArray.push(capturedPieceType);
  }

  // 成りの処理
  let movedPiece = piece;
  if (promote) {
    const promotionMap: Record<PieceType, PieceType> = {
      [PieceType.Pawn]: PieceType.PromotedPawn,
      [PieceType.Lance]: PieceType.PromotedLance,
      [PieceType.Knight]: PieceType.PromotedKnight,
      [PieceType.Silver]: PieceType.PromotedSilver,
      [PieceType.Bishop]: PieceType.PromotedBishop,
      [PieceType.Rook]: PieceType.PromotedRook,
      [PieceType.Gold]: PieceType.Gold,
      [PieceType.King]: PieceType.King,
      [PieceType.PromotedPawn]: PieceType.PromotedPawn,
      [PieceType.PromotedLance]: PieceType.PromotedLance,
      [PieceType.PromotedKnight]: PieceType.PromotedKnight,
      [PieceType.PromotedSilver]: PieceType.PromotedSilver,
      [PieceType.PromotedBishop]: PieceType.PromotedBishop,
      [PieceType.PromotedRook]: PieceType.PromotedRook,
    };

    movedPiece = {
      ...piece,
      type: promotionMap[piece.type] ?? piece.type,
    };
  }

  newBoard.cells[to.row][to.col] = movedPiece;
  newBoard.cells[from.row][from.col] = null;

  return newBoard;
}

/**
 * 持ち駒を打った後の盤面をシミュレート
 */
function simulateDrop(
  board: Board,
  pieceType: PieceType,
  position: Position
): Board {
  const newBoard: Board = {
    ...board,
    cells: board.cells.map((row) => [...row]),
    senteHands: [...board.senteHands],
    goteHands: [...board.goteHands],
    turn: board.turn,
  };

  // 持ち駒から削除
  const capturedArray =
    board.turn === Player.Sente ? newBoard.senteHands : newBoard.goteHands;
  const index = capturedArray.indexOf(pieceType);
  if (index > -1) {
    capturedArray.splice(index, 1);
  }

  // 盤面に配置
  newBoard.cells[position.row][position.col] = {
    type: pieceType,
    player: board.turn,
  };

  return newBoard;
}

/**
 * USI形式の手が合法かどうかを判定する
 *
 * @param board 現在の盤面
 * @param usiMove USI形式の手（例: "7g7f", "7g7f+", "P*5e"）
 * @returns 合法手の場合true、そうでない場合false
 */
export function isLegalMove(board: Board, usiMove: string): boolean {
  // 空文字列のチェック
  if (!usiMove || usiMove.length === 0) {
    return false;
  }

  // 駒打ちの場合（例: P*5e）
  if (usiMove.includes("*")) {
    return isLegalDrop(board, usiMove);
  }

  // 通常の移動の場合（例: 7g7f, 7g7f+）
  return isLegalNormalMove(board, usiMove);
}

/**
 * 駒打ちが合法かどうかを判定
 */
function isLegalDrop(board: Board, usiMove: string): boolean {
  const parts = usiMove.split("*");
  if (parts.length !== 2) {
    return false;
  }

  const [pieceChar, toPos] = parts;
  const pieceType = usiPieceType[pieceChar];

  if (!pieceType) {
    return false;
  }

  // 持ち駒にその駒があるか確認
  const capturedPieces =
    board.turn === Player.Sente ? board.senteHands : board.goteHands;
  if (!capturedPieces.includes(pieceType)) {
    return false;
  }

  // 移動先の位置をパース
  const toPosition = parsePosition(toPos);
  if (!toPosition) {
    return false;
  }

  // 移動先が空いているか確認
  if (board.cells[toPosition.row][toPosition.col] !== null) {
    return false;
  }

  // 合法な打ち位置を取得
  const legalDropPositions = getDropPositions(board, pieceType, board.turn);

  // 指定位置が合法な打ち位置に含まれているか確認
  const isLegalPosition = legalDropPositions.some(
    (pos) => pos.row === toPosition.row && pos.col === toPosition.col
  );

  if (!isLegalPosition) {
    return false;
  }

  // 打った後に自分の王が王手になっていないか確認
  const newBoard = simulateDrop(board, pieceType, toPosition);
  if (isInCheck(newBoard, board.turn)) {
    return false;
  }

  return true;
}
