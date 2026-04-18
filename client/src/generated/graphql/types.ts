/**
 * REST + SSE ベースの互換レイヤー
 *
 * 元はGraphQL Code Generatorによる自動生成ファイルだった。
 * ファイルパスを保ったまま、手書きのHook群に置き換えることで、
 * 呼び出し側（components/）のimportを一切変更せずに移行している。
 *
 * 実体は `client/src/lib/api.ts` + `client/src/lib/queryCache.ts`
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  api,
  subscribe,
  type ChatMessageDto,
  type MatchEvaluationDto,
  type MatchStateDto,
  type MatchWithRelations,
} from "../../lib/api";
import { invalidatePrefix, runSuspense } from "../../lib/queryCache";

// ============================================================
// 基本型
// ============================================================

export type Maybe<T> = T | null | undefined;

export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  MatchPlayer: { input: "SENTE" | "GOTE"; output: "SENTE" | "GOTE" };
  MatchStatus: {
    input: "ONGOING" | "COMPLETED" | "ABANDONED";
    output: "ONGOING" | "COMPLETED" | "ABANDONED";
  };
  MessageRole: { input: "USER" | "ASSISTANT"; output: "USER" | "ASSISTANT" };
  PlayerType: { input: "HUMAN" | "AI"; output: "HUMAN" | "AI" };
  jsonb: { input: unknown; output: unknown };
  timestamp: { input: string; output: string };
};

/** AIプロンプトのパーソナリティ設定 */
export const AiPersonality = {
  Always: "always",
  None: "none",
  Situational: "situational",
} as const;

export type AiPersonality = (typeof AiPersonality)[keyof typeof AiPersonality];

/** 候補手情報 */
export interface MoveVariation {
  move: string;
  scoreCp?: number | null;
  scoreMate?: number | null;
  depth: number;
  nodes?: number | null;
  pv?: string[] | null;
}

/** 最善手コンテンツ */
export interface BestMoveContent {
  __typename?: "BestMoveContent";
  type: "bestmove";
  bestmove: string;
  variations: MoveVariation[];
  timeMs: number;
  engineName: string;
  sfen: string;
}

/** Match DTO（画面用に旧GraphQL型に合わせる） */
export interface Match {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: "ONGOING" | "COMPLETED" | "ABANDONED";
  playerSente: string | null;
  playerGote: string | null;
  senteType: "HUMAN" | "AI";
  goteType: "HUMAN" | "AI";
}

/** MatchState DTO */
export interface MatchState {
  matchId: string;
  index: number;
  usiMove: string | null;
  sfen: string;
  thinkingTime: number | null;
  createdAt: string;
}

/** ChatMessage DTO */
export interface ChatMessage {
  id: string;
  matchId: string;
  role: "USER" | "ASSISTANT";
  contents: unknown;
  isPartial: boolean;
  metadata?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** クエリ結果型 */
export interface GetMatchesQuery {
  matches: (Match & { matchStates: Pick<MatchState, "index">[] })[];
}

export interface GetMatchQuery {
  matchesByPk: (Match & { matchStates: MatchState[] }) | null;
}

export interface GetChatMessagesQuery {
  chatMessages: ChatMessage[];
}

// ============================================================
// Hook 共通型（urql と同形）
// ============================================================

interface QueryState<T> {
  data?: T;
  error?: Error;
  fetching: boolean;
}

interface MutationState {
  fetching: boolean;
  error?: Error;
}

interface MutationResult<T> {
  data?: T;
  error?: Error;
}

type Refetcher = (opts?: { requestPolicy?: "network-only" | "cache-first" }) => void;

// ============================================================
// Query Hooks（Suspenseベース）
// ============================================================

/** 対局一覧 */
export function useGetMatchesQuery(): [QueryState<GetMatchesQuery>, Refetcher] {
  const [bust, setBust] = useState(0);
  const key = `matches:list:${bust}`;
  const matches = runSuspense(key, () => api.listMatches());

  const result: GetMatchesQuery = {
    matches: matches.map((m) => ({
      ...m,
      // MatchesPage は matchStates.length を使うだけなので、stateCount代わりに
      // ダミー配列を返す（最小手数分）。UIでの棋譜表示には使われていない
      matchStates: [],
    })),
  };

  const refetch: Refetcher = useCallback(() => {
    invalidatePrefix("matches:list:");
    setBust((v) => v + 1);
  }, []);

  return [{ data: result, fetching: false, error: undefined }, refetch];
}

/** 単一対局 */
export function useGetMatchQuery(options: {
  variables: { matchId: string };
  pause?: boolean;
}): [QueryState<GetMatchQuery>, Refetcher] {
  const [bust, setBust] = useState(0);
  const { matchId } = options.variables;
  const paused = options.pause ?? false;

  let data: GetMatchQuery | undefined;
  if (!paused) {
    const key = `match:${matchId}:${bust}`;
    const match = runSuspense<MatchWithRelations | null>(key, async () => {
      try {
        return await api.getMatch(matchId);
      } catch {
        return null;
      }
    });
    data = {
      matchesByPk: match
        ? {
            ...match,
            matchStates: match.states,
          }
        : null,
    };
  }

  const refetch: Refetcher = useCallback(() => {
    invalidatePrefix(`match:${matchId}:`);
    setBust((v) => v + 1);
  }, [matchId]);

  return [{ data, fetching: false, error: undefined }, refetch];
}

/** チャットメッセージ一覧（初回fetch） */
export function useGetChatMessagesQuery(options: {
  variables: { matchId: string };
  pause?: boolean;
}): [QueryState<GetChatMessagesQuery>, Refetcher] {
  const [bust, setBust] = useState(0);
  const { matchId } = options.variables;
  const paused = options.pause ?? false;

  let data: GetChatMessagesQuery | undefined;
  if (!paused) {
    const key = `chatMessages:${matchId}:${bust}`;
    const messages = runSuspense(key, () => api.listMessages(matchId));
    data = {
      chatMessages: messages.map(toChatMessage),
    };
  }

  const refetch: Refetcher = useCallback(() => {
    invalidatePrefix(`chatMessages:${matchId}:`);
    setBust((v) => v + 1);
  }, [matchId]);

  return [{ data, fetching: false, error: undefined }, refetch];
}

/** 評価値遷移 */
export function useGetMatchEvaluationsQuery(options: {
  variables: { matchId: string };
  pause?: boolean;
  requestPolicy?: "network-only" | "cache-first";
}): [QueryState<{ matchEvaluations: MatchEvaluationDto[] }>, Refetcher] {
  const [state, setState] = useState<QueryState<{ matchEvaluations: MatchEvaluationDto[] }>>({
    fetching: false,
  });

  const { matchId } = options.variables;
  const paused = options.pause ?? false;
  const requestPolicy = options.requestPolicy ?? "cache-first";

  useEffect(() => {
    if (paused) return;
    setState({ fetching: true });
    api
      .listEvaluations(matchId)
      .then((data) => setState({ data: { matchEvaluations: data }, fetching: false }))
      .catch((error: unknown) =>
        setState({
          error: error instanceof Error ? error : new Error(String(error)),
          fetching: false,
        }),
      );
  }, [matchId, paused, requestPolicy]);

  const refetch: Refetcher = useCallback(() => {
    if (paused) return;
    setState({ fetching: true });
    api
      .listEvaluations(matchId)
      .then((data) => setState({ data: { matchEvaluations: data }, fetching: false }))
      .catch((error: unknown) =>
        setState({
          error: error instanceof Error ? error : new Error(String(error)),
          fetching: false,
        }),
      );
  }, [matchId, paused]);

  return [state, refetch];
}

/** ヘルスチェック */
export function useHealthQuery(): [QueryState<{ health: { status: string; timestamp: string } }>] {
  const [state, setState] = useState<QueryState<{ health: { status: string; timestamp: string } }>>(
    { fetching: true },
  );
  useEffect(() => {
    api
      .health()
      .then((data) => setState({ data: { health: data }, fetching: false }))
      .catch((error: unknown) =>
        setState({
          error: error instanceof Error ? error : new Error(String(error)),
          fetching: false,
        }),
      );
  }, []);
  return [state];
}

// ============================================================
// Subscription Hooks（SSE/EventSource）
// ============================================================

/** SSE経由でMatchStatesを購読 */
export function useSubscribeMatchStatesSubscription(options: {
  variables: { matchId: string };
  pause?: boolean;
}): [QueryState<{ matchStates: MatchState[] }>] {
  const { matchId } = options.variables;
  const paused = options.pause ?? false;
  const [state, setState] = useState<QueryState<{ matchStates: MatchState[] }>>({ fetching: true });
  const itemsRef = useRef<Map<number, MatchState>>(new Map());

  useEffect(() => {
    if (paused) return;
    itemsRef.current = new Map();

    const unsubscribe = subscribe<MatchStateDto>(
      `/api/matches/${matchId}/states/stream`,
      "state",
      (dto) => {
        itemsRef.current.set(dto.index, dto);
        const sorted = [...itemsRef.current.values()].sort((a, b) => a.index - b.index);
        setState({ data: { matchStates: sorted }, fetching: false });
      },
    );
    return unsubscribe;
  }, [matchId, paused]);

  return [state];
}

/** SSE経由でChatMessagesを購読（全件） */
export function useSubscribeChatMessagesSubscription(options: {
  variables: { matchId: string };
  pause?: boolean;
}): [QueryState<{ chatMessages: ChatMessage[] }>] {
  const { matchId } = options.variables;
  const paused = options.pause ?? false;
  const [state, setState] = useState<QueryState<{ chatMessages: ChatMessage[] }>>({
    fetching: true,
  });
  const itemsRef = useRef<Map<string, ChatMessage>>(new Map());

  useEffect(() => {
    if (paused) return;
    itemsRef.current = new Map();

    const unsubscribe = subscribe<ChatMessageDto>(
      `/api/matches/${matchId}/messages/stream`,
      "message",
      (dto) => {
        itemsRef.current.set(dto.id, toChatMessage(dto));
        const sorted = [...itemsRef.current.values()].sort((a, b) =>
          a.createdAt.localeCompare(b.createdAt),
        );
        setState({ data: { chatMessages: sorted }, fetching: false });
      },
    );
    return unsubscribe;
  }, [matchId, paused]);

  return [state];
}

/**
 * ストリーミングSubscription互換
 *
 * 旧 `SubscribeChatMessagesStreamSubscription` はカーソル以降のメッセージを
 * 差分で受け取るものだが、SSE実装ではサーバ側がupdatedAtで差分を返すため、
 * クライアント側では単純に全てを受信して上書きすれば良い。
 */
export function useSubscribeChatMessagesStreamSubscription(options: {
  variables: { matchId: string; cursor: string };
  pause?: boolean;
}): [QueryState<{ chatMessagesStream: ChatMessage[] }>] {
  const { matchId } = options.variables;
  const paused = options.pause ?? false;
  const [state, setState] = useState<QueryState<{ chatMessagesStream: ChatMessage[] }>>({
    fetching: true,
  });
  const itemsRef = useRef<Map<string, ChatMessage>>(new Map());

  useEffect(() => {
    if (paused) return;
    itemsRef.current = new Map();

    const unsubscribe = subscribe<ChatMessageDto>(
      `/api/matches/${matchId}/messages/stream`,
      "message",
      (dto) => {
        itemsRef.current.set(dto.id, toChatMessage(dto));
        const sorted = [...itemsRef.current.values()].sort((a, b) =>
          a.createdAt.localeCompare(b.createdAt),
        );
        setState({ data: { chatMessagesStream: sorted }, fetching: false });
      },
    );
    return unsubscribe;
  }, [matchId, paused]);

  return [state];
}

// ============================================================
// Mutation Hooks
// ============================================================

/** 対局開始 */
export function useStartMatchMutation(): [
  MutationState,
  (vars: {
    id?: string | null;
    playerSente?: string | null;
    playerGote?: string | null;
    senteType: "HUMAN" | "AI";
    goteType: "HUMAN" | "AI";
  }) => Promise<MutationResult<{ startMatch: Match }>>,
] {
  const [fetching, setFetching] = useState(false);
  const execute = useCallback(
    async (vars: {
      id?: string | null;
      playerSente?: string | null;
      playerGote?: string | null;
      senteType: "HUMAN" | "AI";
      goteType: "HUMAN" | "AI";
    }): Promise<MutationResult<{ startMatch: Match }>> => {
      setFetching(true);
      try {
        const match = await api.startMatch(vars);
        invalidatePrefix("matches:list:");
        return { data: { startMatch: match } };
      } catch (error: unknown) {
        return { error: error instanceof Error ? error : new Error(String(error)) };
      } finally {
        setFetching(false);
      }
    },
    [],
  );
  return [{ fetching }, execute];
}

/** チャットメッセージ送信 */
export function useSendChatMessageMutation(): [
  MutationState,
  (vars: {
    matchId: string;
    content: string;
    aiPersonality?: AiPersonality;
  }) => Promise<MutationResult<{ sendChatMessage: { success: boolean } }>>,
] {
  const [fetching, setFetching] = useState(false);
  const execute = useCallback(
    async (vars: {
      matchId: string;
      content: string;
      aiPersonality?: AiPersonality;
    }): Promise<MutationResult<{ sendChatMessage: { success: boolean } }>> => {
      setFetching(true);
      try {
        const result = await api.sendChatMessage(vars.matchId, {
          content: vars.content,
          aiPersonality: vars.aiPersonality,
        });
        return { data: { sendChatMessage: { success: result.success } } };
      } catch (error: unknown) {
        return { error: error instanceof Error ? error : new Error(String(error)) };
      } finally {
        setFetching(false);
      }
    },
    [],
  );
  return [{ fetching }, execute];
}

/** 巻き戻し */
export function useRewindMatchMutation(): [
  MutationState,
  (vars: { matchId: string; toIndex: number }) => Promise<MutationResult<{ rewindMatch: Match }>>,
] {
  const [fetching, setFetching] = useState(false);
  const execute = useCallback(
    async (vars: {
      matchId: string;
      toIndex: number;
    }): Promise<MutationResult<{ rewindMatch: Match }>> => {
      setFetching(true);
      try {
        const match = await api.rewindMatch(vars.matchId, vars.toIndex);
        invalidatePrefix(`match:${vars.matchId}:`);
        return { data: { rewindMatch: match } };
      } catch (error: unknown) {
        return { error: error instanceof Error ? error : new Error(String(error)) };
      } finally {
        setFetching(false);
      }
    },
    [],
  );
  return [{ fetching }, execute];
}

/** 分岐 */
export function useForkMatchMutation(): [
  MutationState,
  (vars: { matchId: string; fromIndex: number }) => Promise<MutationResult<{ forkMatch: Match }>>,
] {
  const [fetching, setFetching] = useState(false);
  const execute = useCallback(
    async (vars: {
      matchId: string;
      fromIndex: number;
    }): Promise<MutationResult<{ forkMatch: Match }>> => {
      setFetching(true);
      try {
        const match = await api.forkMatch(vars.matchId, vars.fromIndex);
        invalidatePrefix("matches:list:");
        return { data: { forkMatch: match } };
      } catch (error: unknown) {
        return { error: error instanceof Error ? error : new Error(String(error)) };
      } finally {
        setFetching(false);
      }
    },
    [],
  );
  return [{ fetching }, execute];
}

// ============================================================
// Helpers
// ============================================================

function toChatMessage(dto: ChatMessageDto): ChatMessage {
  return {
    id: dto.id,
    matchId: dto.matchId,
    role: dto.role,
    contents: dto.contents,
    isPartial: dto.isPartial,
    metadata: dto.metadata,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export type { MatchEvaluationDto };
