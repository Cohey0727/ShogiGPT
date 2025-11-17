import type { GraphQLResolveInfo } from 'graphql';
export type Maybe<T> = T | null | undefined;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

/** 局面解析リクエスト */
export type AnalysisInput = {
  /** 探索深さ（指定時はtimeMsを無視） */
  depth?: InputMaybe<Scalars['Int']['input']>;
  /** 初期局面からの指し手リスト（USI形式） */
  moves?: InputMaybe<Array<Scalars['String']['input']>>;
  /** 候補手の数（MultiPV、デフォルト: 1） */
  multipv?: InputMaybe<Scalars['Int']['input']>;
  /** SFEN形式の局面文字列（省略時は平手初期局面） */
  sfen?: InputMaybe<Scalars['String']['input']>;
  /** 思考時間（ミリ秒、デフォルト: 1000） */
  timeMs?: InputMaybe<Scalars['Int']['input']>;
};

/** 局面解析結果 */
export type AnalysisResult = {
  __typename?: 'AnalysisResult';
  /** 最善手（USI形式） */
  bestmove: Scalars['String']['output'];
  /** エンジン名 */
  engineName: Scalars['String']['output'];
  /** 実際の思考時間（ミリ秒） */
  timeMs: Scalars['Int']['output'];
  /** 候補手リスト（MultiPV） */
  variations: Array<MoveVariation>;
};

/** チャットメッセージ */
export type ChatMessage = {
  __typename?: 'ChatMessage';
  /** メッセージ内容 */
  content: Scalars['String']['output'];
  /** 作成日時 */
  createdAt: Scalars['String']['output'];
  /** メッセージID */
  id: Scalars['String']['output'];
  /** 入力途中かどうか（AI応答待ち） */
  isPartial: Scalars['Boolean']['output'];
  /** 対局ID */
  matchId: Scalars['String']['output'];
  /** メッセージ役割 */
  role: Scalars['String']['output'];
};

/** 対局作成リクエスト */
export type CreateMatchInput = {
  /** 対局ID（指定しない場合は自動生成） */
  id?: InputMaybe<Scalars['String']['input']>;
  /** 後手のプレイヤー名 */
  playerGote?: InputMaybe<Scalars['String']['input']>;
  /** 先手のプレイヤー名 */
  playerSente?: InputMaybe<Scalars['String']['input']>;
};

export type Health = {
  __typename?: 'Health';
  status: Scalars['String']['output'];
  timestamp: Scalars['String']['output'];
};

/** 対局情報 */
export type Match = {
  __typename?: 'Match';
  /** 作成日時 */
  createdAt: Scalars['String']['output'];
  /** 対局ID */
  id: Scalars['String']['output'];
  /** 後手のプレイヤー名 */
  playerGote?: Maybe<Scalars['String']['output']>;
  /** 先手のプレイヤー名 */
  playerSente?: Maybe<Scalars['String']['output']>;
  /** 対局状況 */
  status: Scalars['String']['output'];
  /** 更新日時 */
  updatedAt: Scalars['String']['output'];
};

/** 対局状態 */
export type MatchState = {
  __typename?: 'MatchState';
  /** 作成日時 */
  createdAt: Scalars['String']['output'];
  /** 状態ID */
  id: Scalars['String']['output'];
  /** 局面番号 */
  index: Scalars['Int']['output'];
  /** 対局ID */
  matchId: Scalars['String']['output'];
  /** 指し手（USI形式） */
  moveNotation?: Maybe<Scalars['String']['output']>;
  /** 手番プレイヤー */
  player: Scalars['String']['output'];
  /** 盤面（SFEN形式） */
  sfen: Scalars['String']['output'];
  /** 消費時間（秒） */
  thinkingTime?: Maybe<Scalars['Int']['output']>;
};

/** 1つの候補手情報 */
export type MoveVariation = {
  __typename?: 'MoveVariation';
  /** 探索深さ */
  depth: Scalars['Int']['output'];
  /** 指し手（USI形式） */
  move: Scalars['String']['output'];
  /** 探索ノード数 */
  nodes?: Maybe<Scalars['Int']['output']>;
  /** 読み筋（PV） */
  pv?: Maybe<Array<Scalars['String']['output']>>;
  /** 評価値（センチポーン） */
  scoreCp?: Maybe<Scalars['Int']['output']>;
  /** 詰みまでの手数（プライ数） */
  scoreMate?: Maybe<Scalars['Int']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  analyzePosition: AnalysisResult;
  createMatch: Match;
  saveMatchStateAndGetCandidates: SaveMatchStateResult;
  sendChatMessage: SendChatMessageResult;
};


export type MutationAnalyzePositionArgs = {
  input: AnalysisInput;
};


export type MutationCreateMatchArgs = {
  input: CreateMatchInput;
};


export type MutationSaveMatchStateAndGetCandidatesArgs = {
  input: SaveMatchStateInput;
};


export type MutationSendChatMessageArgs = {
  input: SendChatMessageInput;
};

export type Query = {
  __typename?: 'Query';
  health: Health;
};

/** 対局状態保存リクエスト */
export type SaveMatchStateInput = {
  /** 局面番号（何手目か） */
  index: Scalars['Int']['input'];
  /** 対局ID */
  matchId: Scalars['String']['input'];
  /** この局面に至った指し手（USI形式） */
  moveNotation?: InputMaybe<Scalars['String']['input']>;
  /** 候補手の数（MultiPV、デフォルト: 3） */
  multipv?: InputMaybe<Scalars['Int']['input']>;
  /** この盤面での手番プレイヤー（SENTE/GOTE） */
  player: Scalars['String']['input'];
  /** 盤面（SFEN形式） */
  sfen: Scalars['String']['input'];
  /** 消費時間（秒） */
  thinkingTime?: InputMaybe<Scalars['Int']['input']>;
  /** 思考時間（ミリ秒、デフォルト: 1000） */
  timeMs?: InputMaybe<Scalars['Int']['input']>;
};

/** 対局状態保存結果 */
export type SaveMatchStateResult = {
  __typename?: 'SaveMatchStateResult';
  /** 次の候補手リスト */
  candidates: Array<MoveVariation>;
  /** 保存された対局状態 */
  matchState: MatchState;
};

/** チャットメッセージ送信リクエスト */
export type SendChatMessageInput = {
  /** メッセージ内容 */
  content: Scalars['String']['input'];
  /** 対局ID */
  matchId: Scalars['String']['input'];
};

/** チャットメッセージ送信結果 */
export type SendChatMessageResult = {
  __typename?: 'SendChatMessageResult';
  /** AIアシスタントの応答メッセージ */
  assistantMessage: ChatMessage;
  /** 作成されたユーザーメッセージ */
  userMessage: ChatMessage;
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = Record<PropertyKey, never>, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;





/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  AnalysisInput: AnalysisInput;
  AnalysisResult: ResolverTypeWrapper<AnalysisResult>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  ChatMessage: ResolverTypeWrapper<ChatMessage>;
  CreateMatchInput: CreateMatchInput;
  Health: ResolverTypeWrapper<Health>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Match: ResolverTypeWrapper<Match>;
  MatchState: ResolverTypeWrapper<MatchState>;
  MoveVariation: ResolverTypeWrapper<MoveVariation>;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  SaveMatchStateInput: SaveMatchStateInput;
  SaveMatchStateResult: ResolverTypeWrapper<SaveMatchStateResult>;
  SendChatMessageInput: SendChatMessageInput;
  SendChatMessageResult: ResolverTypeWrapper<SendChatMessageResult>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  AnalysisInput: AnalysisInput;
  AnalysisResult: AnalysisResult;
  Boolean: Scalars['Boolean']['output'];
  ChatMessage: ChatMessage;
  CreateMatchInput: CreateMatchInput;
  Health: Health;
  Int: Scalars['Int']['output'];
  Match: Match;
  MatchState: MatchState;
  MoveVariation: MoveVariation;
  Mutation: Record<PropertyKey, never>;
  Query: Record<PropertyKey, never>;
  SaveMatchStateInput: SaveMatchStateInput;
  SaveMatchStateResult: SaveMatchStateResult;
  SendChatMessageInput: SendChatMessageInput;
  SendChatMessageResult: SendChatMessageResult;
  String: Scalars['String']['output'];
}>;

export type AnalysisResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['AnalysisResult'] = ResolversParentTypes['AnalysisResult']> = ResolversObject<{
  bestmove?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  engineName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  timeMs?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  variations?: Resolver<Array<ResolversTypes['MoveVariation']>, ParentType, ContextType>;
}>;

export type ChatMessageResolvers<ContextType = any, ParentType extends ResolversParentTypes['ChatMessage'] = ResolversParentTypes['ChatMessage']> = ResolversObject<{
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  isPartial?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  matchId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type HealthResolvers<ContextType = any, ParentType extends ResolversParentTypes['Health'] = ResolversParentTypes['Health']> = ResolversObject<{
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type MatchResolvers<ContextType = any, ParentType extends ResolversParentTypes['Match'] = ResolversParentTypes['Match']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  playerGote?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  playerSente?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type MatchStateResolvers<ContextType = any, ParentType extends ResolversParentTypes['MatchState'] = ResolversParentTypes['MatchState']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  index?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  matchId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  moveNotation?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  player?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  sfen?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  thinkingTime?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type MoveVariationResolvers<ContextType = any, ParentType extends ResolversParentTypes['MoveVariation'] = ResolversParentTypes['MoveVariation']> = ResolversObject<{
  depth?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  move?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nodes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  pv?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  scoreCp?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  scoreMate?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  analyzePosition?: Resolver<ResolversTypes['AnalysisResult'], ParentType, ContextType, RequireFields<MutationAnalyzePositionArgs, 'input'>>;
  createMatch?: Resolver<ResolversTypes['Match'], ParentType, ContextType, RequireFields<MutationCreateMatchArgs, 'input'>>;
  saveMatchStateAndGetCandidates?: Resolver<ResolversTypes['SaveMatchStateResult'], ParentType, ContextType, RequireFields<MutationSaveMatchStateAndGetCandidatesArgs, 'input'>>;
  sendChatMessage?: Resolver<ResolversTypes['SendChatMessageResult'], ParentType, ContextType, RequireFields<MutationSendChatMessageArgs, 'input'>>;
}>;

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  health?: Resolver<ResolversTypes['Health'], ParentType, ContextType>;
}>;

export type SaveMatchStateResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['SaveMatchStateResult'] = ResolversParentTypes['SaveMatchStateResult']> = ResolversObject<{
  candidates?: Resolver<Array<ResolversTypes['MoveVariation']>, ParentType, ContextType>;
  matchState?: Resolver<ResolversTypes['MatchState'], ParentType, ContextType>;
}>;

export type SendChatMessageResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['SendChatMessageResult'] = ResolversParentTypes['SendChatMessageResult']> = ResolversObject<{
  assistantMessage?: Resolver<ResolversTypes['ChatMessage'], ParentType, ContextType>;
  userMessage?: Resolver<ResolversTypes['ChatMessage'], ParentType, ContextType>;
}>;

export type Resolvers<ContextType = any> = ResolversObject<{
  AnalysisResult?: AnalysisResultResolvers<ContextType>;
  ChatMessage?: ChatMessageResolvers<ContextType>;
  Health?: HealthResolvers<ContextType>;
  Match?: MatchResolvers<ContextType>;
  MatchState?: MatchStateResolvers<ContextType>;
  MoveVariation?: MoveVariationResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  SaveMatchStateResult?: SaveMatchStateResultResolvers<ContextType>;
  SendChatMessageResult?: SendChatMessageResultResolvers<ContextType>;
}>;

