/**
 * REST APIクライアント
 *
 * 旧 Hasura GraphQL / server GraphQL をすべて server の REST API に集約。
 * Subscription は SSE (EventSource) で受信する。
 */

const DEFAULT_BASE = "http://localhost:8787";

export function getApiBase(): string {
  const explicit = import.meta.env.VITE_API_ENDPOINT as string | undefined;
  if (explicit) return explicit.replace(/\/$/, "");
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const proto = window.location.protocol;
    if (host && host !== "localhost" && host !== "127.0.0.1") {
      return `${proto}//${host}:8787`;
    }
  }
  return DEFAULT_BASE;
}

// ============================================================
// DTO Types（server の DTO と対応）
// ============================================================

export interface MatchDto {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: "ONGOING" | "COMPLETED" | "ABANDONED";
  playerSente: string | null;
  playerGote: string | null;
  senteType: "HUMAN" | "AI";
  goteType: "HUMAN" | "AI";
}

export interface MatchStateDto {
  matchId: string;
  index: number;
  usiMove: string;
  sfen: string;
  thinkingTime: number | null;
  createdAt: string;
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

export interface MatchEvaluationDto {
  moveIndex: number;
  scoreCp: number | null;
  scoreMate: number | null;
}

export interface MatchWithRelations extends MatchDto {
  states: MatchStateDto[];
  messages: ChatMessageDto[];
}

// ============================================================
// fetch helpers
// ============================================================

async function jsonFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${getApiBase()}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return (await res.json()) as T;
}

// ============================================================
// API calls
// ============================================================

export const api = {
  health: () => jsonFetch<{ status: string; timestamp: string }>("/healthz"),

  listMatches: () => jsonFetch<MatchDto[]>("/api/matches"),

  getMatch: (matchId: string) => jsonFetch<MatchWithRelations>(`/api/matches/${matchId}`),

  listMessages: (matchId: string) =>
    jsonFetch<ChatMessageDto[]>(`/api/matches/${matchId}/messages`),

  listStates: (matchId: string) => jsonFetch<MatchStateDto[]>(`/api/matches/${matchId}/states`),

  listEvaluations: (matchId: string) =>
    jsonFetch<MatchEvaluationDto[]>(`/api/matches/${matchId}/evaluations`),

  startMatch: (input: {
    id?: string | null;
    playerSente?: string | null;
    playerGote?: string | null;
    senteType: "HUMAN" | "AI";
    goteType: "HUMAN" | "AI";
    sfen?: string | null;
  }) =>
    jsonFetch<MatchDto>("/api/matches", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  sendChatMessage: (
    matchId: string,
    input: { content: string; aiPersonality?: "none" | "situational" | "always" },
  ) =>
    jsonFetch<{ success: boolean; chatMessageId: string }>(`/api/matches/${matchId}/messages`, {
      method: "POST",
      body: JSON.stringify(input),
    }),

  rewindMatch: (matchId: string, toIndex: number) =>
    jsonFetch<MatchDto>(`/api/matches/${matchId}/rewind`, {
      method: "POST",
      body: JSON.stringify({ toIndex }),
    }),

  forkMatch: (matchId: string, fromIndex: number) =>
    jsonFetch<MatchDto>(`/api/matches/${matchId}/fork`, {
      method: "POST",
      body: JSON.stringify({ fromIndex }),
    }),
};

/**
 * SSEで購読。`event` ごとに `onMessage` を呼ぶ。
 * 戻り値はアンサブスクライブ関数。
 */
export function subscribe<T>(
  path: string,
  event: string,
  onMessage: (data: T) => void,
): () => void {
  const url = `${getApiBase()}${path}`;
  const es = new EventSource(url);
  const handler = (e: MessageEvent): void => {
    try {
      onMessage(JSON.parse(e.data) as T);
    } catch (error) {
      console.error(`Failed to parse SSE ${event}:`, error);
    }
  };
  es.addEventListener(event, handler as EventListener);
  return () => {
    es.removeEventListener(event, handler as EventListener);
    es.close();
  };
}
