import type { Board, BoardIndex, PieceType, Position } from "../consts";
import { PieceType as PieceTypeEnum, Player } from "../consts";
import { getPossibleMoves } from "./possibleMoves";
import { getDropPositions } from "./dropPiece";

/**
 * 日本語の指し手をUSI形式に変換
 *
 * サポートする形式:
 * - "7七歩" → 盤面から7七に移動可能な歩を探す
 * - "7六歩(7七)" → 7七から7六への歩の移動
 * - "5五金打" → 5五に金を打つ
 * - "5五金" → 持ち駒があれば打ち、なければ盤面から移動
 * - "2四角成" → 角を2四に移動して成る
 * - "7六歩不成" → 7六に歩を移動するが成らない
 *
 * @param japaneseMove 日本語の指し手
 * @param board 現在の盤面
 * @returns USI形式の指し手、変換できない場合はnull
 */
export function japaneseToUsiMove(
  japaneseMove: string,
  board: Board
): string | null {
  // 空白を削除
  const move = japaneseMove.replace(/\s+/g, "");

  if (move.length === 0) {
    return null;
  }

  // パターン1: 駒打ち（例: "5五金打", "55金打", "５五金打"）
  const dropMatch = move.match(
    /^([１-９1-9])([一二三四五六七八九1-9])(.+?)打$/
  );
  if (dropMatch) {
    const [, file, rank, pieceName] = dropMatch;
    const toPos = japanesePositionToUsi(`${file}${rank}`);
    const usiPiece = japaneseToUsiPiece[pieceName];

    if (toPos && usiPiece) {
      return `${usiPiece}*${toPos}`;
    }
    return null;
  }

  // パターン2: 移動元指定あり（例: "7六歩(7七)", "２四角成(８八)"）
  const moveWithFromMatch = move.match(
    /^([１-９1-9])([一二三四五六七八九])(.+?)(?:成|不成)?\(([１-９1-9])([一二三四五六七八九])\)$/
  );
  if (moveWithFromMatch) {
    const [, toFile, toRank, , fromFile, fromRank] = moveWithFromMatch;
    const toPos = japanesePositionToUsi(`${toFile}${toRank}`);
    const fromPos = japanesePositionToUsi(`${fromFile}${fromRank}`);

    if (!toPos || !fromPos) {
      return null;
    }

    // 成りの判定
    const isPromotion = move.includes("成") && !move.includes("不成");
    const promotionMark = isPromotion ? "+" : "";

    return `${fromPos}${toPos}${promotionMark}`;
  }

  // パターン3: 移動先のみ指定（例: "7六歩", "２四角成"）
  const moveToMatch = move.match(
    /^([１-９1-9])([一二三四五六七八九])(.+?)(成|不成)?$/
  );
  if (moveToMatch) {
    const [, toFile, toRank, pieceName, promotionFlag] = moveToMatch;
    const toPos = japanesePositionToUsi(`${toFile}${toRank}`);

    if (!toPos) {
      return null;
    }

    const toIndex = usiPositionToIndex(toPos);
    if (!toIndex) {
      return null;
    }

    // 成りの判定
    const isPromotion = promotionFlag === "成";

    // 駒のタイプを取得
    const pieceType = japaneseToPieceType[pieceName];

    // まず駒打ちを試す（持ち駒に該当する駒がある場合）
    const capturedPieces =
      board.turn === Player.Sente ? board.senteHands : board.goteHands;
    if (pieceType && capturedPieces.includes(pieceType)) {
      // 駒打ちの場合は成りはない
      if (!isPromotion) {
        const dropPositions = getDropPositions(board, pieceType, board.turn);
        const canDrop = dropPositions.some(
          (pos) => pos.row === toIndex.row && pos.col === toIndex.col
        );
        if (canDrop) {
          const usiPiece = japaneseToUsiPiece[pieceName];
          if (usiPiece) {
            return `${usiPiece}*${toPos}`;
          }
        }
      }
    }

    // 駒打ちができない場合は、盤面から該当する駒を探す
    if (pieceType) {
      const fromPositions = findPiecesCanMoveTo(
        board,
        pieceType,
        board.turn,
        toIndex
      );

      if (fromPositions.length === 1) {
        const from = fromPositions[0];
        const fromPos = indexToUsiPosition(from.row, from.col);
        const promotionMark = isPromotion ? "+" : "";
        return `${fromPos}${toPos}${promotionMark}`;
      } else if (fromPositions.length > 1) {
        // 複数候補がある場合は、最も近い駒を選択（曖昧さ回避）
        // ここでは単純に最初の候補を返す
        const from = fromPositions[0];
        const fromPos = indexToUsiPosition(from.row, from.col);
        const promotionMark = isPromotion ? "+" : "";
        return `${fromPos}${toPos}${promotionMark}`;
      }
    }

    return null;
  }

  return null;
}

/**
 * 日本語の駒名をUSI形式に変換
 */
const japaneseToUsiPiece: Record<string, string> = {
  歩: "P",
  香: "L",
  桂: "N",
  銀: "S",
  金: "G",
  角: "B",
  飛: "R",
  玉: "K",
  王: "K",
  と: "P",
  成香: "L",
  成桂: "N",
  成銀: "S",
  馬: "B",
  竜: "R",
  龍: "R",
};

/**
 * 日本語の駒名からPieceTypeに変換
 */
const japaneseToPieceType: Record<string, PieceType> = {
  歩: PieceTypeEnum.Pawn,
  香: PieceTypeEnum.Lance,
  桂: PieceTypeEnum.Knight,
  銀: PieceTypeEnum.Silver,
  金: PieceTypeEnum.Gold,
  角: PieceTypeEnum.Bishop,
  飛: PieceTypeEnum.Rook,
  玉: PieceTypeEnum.King,
  王: PieceTypeEnum.King,
};

/**
 * 日本語の段（一～九）をUSI形式（a～i）に変換
 */
const japaneseRankToUsi: Record<string, string> = {
  一: "a",
  二: "b",
  三: "c",
  四: "d",
  五: "e",
  六: "f",
  七: "g",
  八: "h",
  九: "i",
};

/**
 * USI形式の座標を盤面インデックスに変換
 */
function usiPositionToIndex(usiPos: string): {
  row: BoardIndex;
  col: BoardIndex;
} | null {
  if (usiPos.length !== 2) {
    return null;
  }

  const file = parseInt(usiPos[0], 10); // 1-9
  const rank = usiPos[1]; // a-i

  if (file < 1 || file > 9) {
    return null;
  }

  const col = 9 - file; // 0-8
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
 * 盤面インデックスをUSI形式の座標に変換
 */
function indexToUsiPosition(row: number, col: number): string {
  const file = 9 - col; // 1-9
  const rankChars = "abcdefghi";
  const rank = rankChars[row];
  return `${file}${rank}`;
}

/**
 * 日本語の位置表記をUSI形式に変換
 * 例: "7七" → "7g", "５五" → "5e", "78" → "7h"
 */
function japanesePositionToUsi(jpPos: string): string | null {
  if (jpPos.length !== 2) {
    return null;
  }

  // 全角数字を半角に変換
  const normalizedPos = jpPos.replace(/[１-９]/g, (s) =>
    String.fromCharCode(s.charCodeAt(0) - 0xfee0)
  );

  // パターン1: 数字2桁の形式（例: "78", "55"）
  if (/^[1-9][1-9]$/.test(normalizedPos)) {
    const file = parseInt(normalizedPos[0], 10);
    const rankNum = parseInt(normalizedPos[1], 10);

    if (file < 1 || file > 9 || rankNum < 1 || rankNum > 9) {
      return null;
    }

    // 数字の段をUSI形式に変換（1→a, 2→b, ..., 9→i）
    const rankChars = "abcdefghi";
    const rank = rankChars[rankNum - 1];

    return `${file}${rank}`;
  }

  // パターン2: 数字+漢数字の形式（例: "7七", "5五"）
  const fileChar = normalizedPos[0];
  const file = parseInt(fileChar, 10);

  if (isNaN(file) || file < 1 || file > 9) {
    return null;
  }

  const rankChar = normalizedPos[1];
  const rank = japaneseRankToUsi[rankChar];

  if (!rank) {
    return null;
  }

  return `${file}${rank}`;
}

/**
 * 指定位置に移動可能な駒の位置を探す
 */
function findPiecesCanMoveTo(
  board: Board,
  pieceType: PieceType,
  player: Player,
  toPosition: Position
): Position[] {
  const result: Position[] = [];

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board.cells[row][col];
      if (
        piece &&
        piece.player === player &&
        (piece.type === pieceType ||
          // 成り駒も考慮
          (pieceType === PieceTypeEnum.Pawn &&
            piece.type === PieceTypeEnum.PromotedPawn) ||
          (pieceType === PieceTypeEnum.Lance &&
            piece.type === PieceTypeEnum.PromotedLance) ||
          (pieceType === PieceTypeEnum.Knight &&
            piece.type === PieceTypeEnum.PromotedKnight) ||
          (pieceType === PieceTypeEnum.Silver &&
            piece.type === PieceTypeEnum.PromotedSilver) ||
          (pieceType === PieceTypeEnum.Bishop &&
            piece.type === PieceTypeEnum.PromotedBishop) ||
          (pieceType === PieceTypeEnum.Rook &&
            piece.type === PieceTypeEnum.PromotedRook))
      ) {
        const fromPosition: Position = {
          row: row as BoardIndex,
          col: col as BoardIndex,
        };
        const possibleMoves = getPossibleMoves(board, fromPosition);

        if (
          possibleMoves.some(
            (pos) => pos.row === toPosition.row && pos.col === toPosition.col
          )
        ) {
          result.push(fromPosition);
        }
      }
    }
  }

  return result;
}
