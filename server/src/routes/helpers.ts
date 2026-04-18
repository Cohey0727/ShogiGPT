import type { ChatMessage, Match, MatchState } from "../db/schema";

/**
 * DB行 → APIレスポンス変換
 *
 * 日付は ISO 文字列化、スネーク→キャメル変換はDrizzleが済ませているので基本そのまま
 */

export interface MatchDto {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  playerSente: string | null;
  playerGote: string | null;
  senteType: "HUMAN" | "AI";
  goteType: "HUMAN" | "AI";
}

export function toMatchDto(match: Match): MatchDto {
  return {
    id: match.id,
    createdAt: match.createdAt.toISOString(),
    updatedAt: match.updatedAt.toISOString(),
    status: match.status,
    playerSente: match.playerSente,
    playerGote: match.playerGote,
    senteType: match.senteType,
    goteType: match.goteType,
  };
}

export interface MatchStateDto {
  matchId: string;
  index: number;
  usiMove: string;
  sfen: string;
  thinkingTime: number | null;
  createdAt: string;
}

export function toMatchStateDto(state: MatchState): MatchStateDto {
  return {
    matchId: state.matchId,
    index: state.index,
    usiMove: state.usiMove,
    sfen: state.sfen,
    thinkingTime: state.thinkingTime,
    createdAt: state.createdAt.toISOString(),
  };
}

export interface ChatMessageDto {
  id: string;
  matchId: string;
  role: "USER" | "ASSISTANT";
  contents: unknown;
  isPartial: boolean;
  metadata: string | null;
  createdAt: string;
  updatedAt: string;
}

export function toChatMessageDto(message: ChatMessage): ChatMessageDto {
  return {
    id: message.id,
    matchId: message.matchId,
    role: message.role,
    contents: message.contents,
    isPartial: message.isPartial,
    metadata: message.metadata,
    createdAt: message.createdAt.toISOString(),
    updatedAt: message.updatedAt.toISOString(),
  };
}
