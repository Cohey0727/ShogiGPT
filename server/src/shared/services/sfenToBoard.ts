import type { Board, Cell, PieceType } from "../consts";
import { Player, PieceType as PT } from "../consts";

/**
 * SFEN文字列から駒の種類へのマッピング
 */
const SFEN_TO_PIECE_TYPE: Record<string, PieceType> = {
  k: PT.King,
  r: PT.Rook,
  b: PT.Bishop,
  g: PT.Gold,
  s: PT.Silver,
  n: PT.Knight,
  l: PT.Lance,
  p: PT.Pawn,
  "+r": PT.PromotedRook,
  "+b": PT.PromotedBishop,
  "+s": PT.PromotedSilver,
  "+n": PT.PromotedKnight,
  "+l": PT.PromotedLance,
  "+p": PT.PromotedPawn,
};

/**
 * SFEN形式の文字列を盤面の状態に変換する
 * @param sfen SFEN形式の文字列
 * @returns 盤面の状態
 */
export function sfenToBoard(sfen: string): Board {
  const parts = sfen.trim().split(/\s+/);

  if (parts.length < 2) {
    throw new Error("Invalid SFEN format: insufficient parts");
  }

  const [boardPart, turnPart, handPart = "-"] = parts;

  // 1. 盤面の解析
  const cells: Cell[][] = [];
  const rows = boardPart.split("/");

  if (rows.length !== 9) {
    throw new Error(`Invalid SFEN format: expected 9 rows, got ${rows.length}`);
  }

  for (const rowStr of rows) {
    const row: Cell[] = [];
    let i = 0;

    while (i < rowStr.length) {
      const char = rowStr[i];

      // 数値（空きマス）の処理
      if (/\d/.test(char)) {
        const emptyCount = parseInt(char, 10);
        for (let j = 0; j < emptyCount; j++) {
          row.push(null);
        }
        i++;
      }
      // 成駒の処理
      else if (char === "+") {
        const nextChar = rowStr[i + 1];
        if (!nextChar) {
          throw new Error(`Invalid SFEN format: incomplete promoted piece`);
        }

        const sfenKey = `+${nextChar.toLowerCase()}`;
        const pieceType = SFEN_TO_PIECE_TYPE[sfenKey];

        if (!pieceType) {
          throw new Error(
            `Invalid SFEN format: unknown promoted piece ${sfenKey}`
          );
        }

        const player = /[A-Z]/.test(nextChar) ? Player.Sente : Player.Gote;
        row.push({ type: pieceType, player });
        i += 2;
      }
      // 通常の駒の処理
      else {
        const sfenKey = char.toLowerCase();
        const pieceType = SFEN_TO_PIECE_TYPE[sfenKey];

        if (!pieceType) {
          throw new Error(`Invalid SFEN format: unknown piece ${char}`);
        }

        const player = /[A-Z]/.test(char) ? Player.Sente : Player.Gote;
        row.push({ type: pieceType, player });
        i++;
      }
    }

    if (row.length !== 9) {
      throw new Error(
        `Invalid SFEN format: expected 9 columns, got ${row.length}`
      );
    }

    cells.push(row);
  }

  // 2. 手番の解析
  const turn = turnPart === "b" ? Player.Sente : Player.Gote;

  // 3. 持ち駒の解析
  const { capturedBySente, capturedByGote } = parseHand(handPart);

  return {
    cells,
    capturedBySente,
    capturedByGote,
    turn,
  };
}

/**
 * SFEN形式の持ち駒文字列を解析する
 */
function parseHand(handPart: string): {
  capturedBySente: PieceType[];
  capturedByGote: PieceType[];
} {
  const capturedBySente: PieceType[] = [];
  const capturedByGote: PieceType[] = [];

  if (handPart === "-") {
    return { capturedBySente, capturedByGote };
  }

  let i = 0;
  while (i < handPart.length) {
    const char = handPart[i];

    // 数値の処理
    if (/\d/.test(char)) {
      // 数値を読み取る
      let numStr = char;
      i++;
      while (i < handPart.length && /\d/.test(handPart[i])) {
        numStr += handPart[i];
        i++;
      }
      const count = parseInt(numStr, 10);

      // 次の文字は駒である必要がある
      if (i >= handPart.length) {
        throw new Error("Invalid SFEN hand format: number without piece");
      }

      const pieceChar = handPart[i];
      const sfenKey = pieceChar.toLowerCase();
      const pieceType = SFEN_TO_PIECE_TYPE[sfenKey];

      if (!pieceType) {
        throw new Error(`Invalid SFEN hand format: unknown piece ${pieceChar}`);
      }

      const targetArray = /[A-Z]/.test(pieceChar)
        ? capturedBySente
        : capturedByGote;

      for (let j = 0; j < count; j++) {
        targetArray.push(pieceType);
      }

      i++;
    }
    // 駒の処理
    else {
      const sfenKey = char.toLowerCase();
      const pieceType = SFEN_TO_PIECE_TYPE[sfenKey];

      if (!pieceType) {
        throw new Error(`Invalid SFEN hand format: unknown piece ${char}`);
      }

      const targetArray = /[A-Z]/.test(char) ? capturedBySente : capturedByGote;
      targetArray.push(pieceType);

      i++;
    }
  }

  return { capturedBySente, capturedByGote };
}
