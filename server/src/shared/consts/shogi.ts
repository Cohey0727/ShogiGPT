import { objectEntries } from "../utils";

/**
 * プレイヤー（先手/後手）
 */
export const Player = {
  /** 先手 */
  Sente: "SENTE",
  /** 後手 */
  Gote: "GOTE",
} as const;

export type Player = (typeof Player)[keyof typeof Player];

/**
 * 駒の種類
 */
export const PieceType = {
  /** 王将/玉将 */
  King: "king",
  /** 飛車 */
  Rook: "rook",
  /** 角行 */
  Bishop: "bishop",
  /** 金将 */
  Gold: "gold",
  /** 銀将 */
  Silver: "silver",
  /** 桂馬 */
  Knight: "knight",
  /** 香車 */
  Lance: "lance",
  /** 歩兵 */
  Pawn: "pawn",
  /** 竜王 */
  PromotedRook: "promoted_rook",
  /** 竜馬 */
  PromotedBishop: "promoted_bishop",
  /** 成銀 */
  PromotedSilver: "promoted_silver",
  /** 成桂 */
  PromotedKnight: "promoted_knight",
  /** 成香 */
  PromotedLance: "promoted_lance",
  /** と金（成り歩） */
  PromotedPawn: "promoted_pawn",
} as const;

export type PieceType = (typeof PieceType)[keyof typeof PieceType];

/**
 * 駒
 */
export interface BoardPiece {
  /** 駒の種類 */
  type: PieceType;
  /** 駒の所有者 */
  player: Player;
}

/**
 * 局面のインデックス（0-8）
 */
export type BoardIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/**
 * 局面の位置
 */
export interface Position {
  /** 行（0-8） */
  row: BoardIndex;
  /** 列（0-8） */
  col: BoardIndex;
}

/**
 * 局面のセル
 */
export type Cell = BoardPiece | null;

/**
 * 局面
 */
export interface Board {
  /** 盤上（9x9の2次元配列） */
  cells: Cell[][];
  /** 先手の持ち駒 */
  senteHands: PieceType[];
  /** 後手の持ち駒 */
  goteHands: PieceType[];
  /** 手番 */
  turn: Player;
}

/**
 * 駒のプロパティ
 */
export interface Piece {
  /** 駒の種類 */
  type: PieceType;
  /** 駒の日本語表記 */
  name: string;
  /** 駒の短縮表記 */
  shortName: string;
  /** USI形式の駒文字 */
  usi: string;
  /** 駒の画像ファイル名 */
  image: string;
  /** 成った後の駒（undefined = 成れない） */
  promoted?: PieceType;
  /** 成る前の駒（undefined = 成り駒ではない） */
  unpromoted?: PieceType;
}

/**
 * 各駒のプロパティ定義
 */
export const pieces: Record<PieceType, Piece> = {
  [PieceType.King]: {
    type: PieceType.King,
    name: "王将",
    shortName: "王",
    usi: "K",
    image: "/assets/pieces/king.png",
  },
  [PieceType.Rook]: {
    type: PieceType.Rook,
    name: "飛車",
    shortName: "飛",
    usi: "R",
    image: "/assets/pieces/rook.png",
    promoted: PieceType.PromotedRook,
  },
  [PieceType.Bishop]: {
    type: PieceType.Bishop,
    name: "角行",
    shortName: "角",
    usi: "B",
    image: "/assets/pieces/bishop.png",
    promoted: PieceType.PromotedBishop,
  },
  [PieceType.Gold]: {
    type: PieceType.Gold,
    name: "金将",
    shortName: "金",
    usi: "G",
    image: "/assets/pieces/gold.png",
  },
  [PieceType.Silver]: {
    type: PieceType.Silver,
    name: "銀将",
    shortName: "銀",
    usi: "S",
    image: "/assets/pieces/silver.png",
    promoted: PieceType.PromotedSilver,
  },
  [PieceType.Knight]: {
    type: PieceType.Knight,
    name: "桂馬",
    shortName: "桂",
    usi: "N",
    image: "/assets/pieces/knight.png",
    promoted: PieceType.PromotedKnight,
  },
  [PieceType.Lance]: {
    type: PieceType.Lance,
    name: "香車",
    shortName: "香",
    usi: "L",
    image: "/assets/pieces/lance.png",
    promoted: PieceType.PromotedLance,
  },
  [PieceType.Pawn]: {
    type: PieceType.Pawn,
    name: "歩兵",
    shortName: "歩",
    usi: "P",
    image: "/assets/pieces/pawn.png",
    promoted: PieceType.PromotedPawn,
  },
  [PieceType.PromotedRook]: {
    type: PieceType.PromotedRook,
    name: "竜王",
    shortName: "竜",
    usi: "R",
    image: "/assets/pieces/promoted_rook.png",
    unpromoted: PieceType.Rook,
  },
  [PieceType.PromotedBishop]: {
    type: PieceType.PromotedBishop,
    name: "竜馬",
    shortName: "馬",
    usi: "B",
    image: "/assets/pieces/promoted_bishop.png",
    unpromoted: PieceType.Bishop,
  },
  [PieceType.PromotedSilver]: {
    type: PieceType.PromotedSilver,
    name: "成銀",
    shortName: "全",
    usi: "S",
    image: "/assets/pieces/promoted_silver.png",
    unpromoted: PieceType.Silver,
  },
  [PieceType.PromotedKnight]: {
    type: PieceType.PromotedKnight,
    name: "成桂",
    shortName: "圭",
    usi: "N",
    image: "/assets/pieces/promoted_knight.png",
    unpromoted: PieceType.Knight,
  },
  [PieceType.PromotedLance]: {
    type: PieceType.PromotedLance,
    name: "成香",
    shortName: "杏",
    usi: "L",
    image: "/assets/pieces/promoted_lance.png",
    unpromoted: PieceType.Lance,
  },
  [PieceType.PromotedPawn]: {
    type: PieceType.PromotedPawn,
    name: "と金",
    shortName: "と",
    usi: "P",
    image: "/assets/pieces/promoted_pawn.png",
    unpromoted: PieceType.Pawn,
  },
};

export const japaneseToPiece = objectEntries(pieces).reduce(
  (acc, [, piece]) => {
    acc[piece.name] = piece;
    acc[piece.shortName] = piece;
    return acc;
  },
  {} as Record<string, Piece>,
);
