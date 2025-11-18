import type { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null | undefined;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** プレイヤータイプ（HUMAN または AI） */
  PlayerType: { input: any; output: any; }
};

/** 最善手コンテンツ（盤面解析結果） */
export type BestMoveContent = {
  __typename?: 'BestMoveContent';
  /** 最善手（USI形式） */
  bestmove: Scalars['String']['output'];
  /** エンジン名 */
  engineName: Scalars['String']['output'];
  /** 思考時間（ミリ秒） */
  timeMs: Scalars['Int']['output'];
  type: Scalars['String']['output'];
  /** 候補手リスト（MultiPV） */
  variations: Array<MoveVariation>;
};

/** チャットメッセージ */
export type ChatMessage = {
  __typename?: 'ChatMessage';
  /** メッセージコンテンツ（Markdownや候補手などを含む配列） */
  contents: Array<MessageContent>;
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
  /** 後手のプレイヤータイプ */
  goteType?: InputMaybe<Scalars['PlayerType']['input']>;
  /** 対局ID（指定しない場合は自動生成） */
  id?: InputMaybe<Scalars['String']['input']>;
  /** 後手のプレイヤー名 */
  playerGote?: InputMaybe<Scalars['String']['input']>;
  /** 先手のプレイヤー名 */
  playerSente?: InputMaybe<Scalars['String']['input']>;
  /** 先手のプレイヤータイプ */
  senteType?: InputMaybe<Scalars['PlayerType']['input']>;
};

/** 対局状態評価リクエスト */
export type EvaluateMatchStateInput = {
  /** 局面番号 */
  index: Scalars['Int']['input'];
  /** 対局ID */
  matchId: Scalars['String']['input'];
  /** 候補手の数（MultiPV、デフォルト: 3） */
  multipv?: InputMaybe<Scalars['Int']['input']>;
  /** 消費時間（秒） */
  thinkingTime?: InputMaybe<Scalars['Int']['input']>;
};

/** 対局状態評価結果 */
export type EvaluateMatchStateResult = {
  __typename?: 'EvaluateMatchStateResult';
  /** 評価対象のMatchStateのID */
  matchStateId: Scalars['String']['output'];
  /** 成功したかどうか */
  success: Scalars['Boolean']['output'];
  /** 思考中を示すチャットメッセージ */
  thinkingMessage: ChatMessage;
};

export type Health = {
  __typename?: 'Health';
  status: Scalars['String']['output'];
  timestamp: Scalars['String']['output'];
};

/** Markdownコンテンツ */
export type MarkdownContent = {
  __typename?: 'MarkdownContent';
  content: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

/** 対局情報 */
export type Match = {
  __typename?: 'Match';
  /** 作成日時 */
  createdAt: Scalars['String']['output'];
  /** 後手のプレイヤータイプ */
  goteType: Scalars['PlayerType']['output'];
  /** 対局ID */
  id: Scalars['String']['output'];
  /** 後手のプレイヤー名 */
  playerGote?: Maybe<Scalars['String']['output']>;
  /** 先手のプレイヤー名 */
  playerSente?: Maybe<Scalars['String']['output']>;
  /** 先手のプレイヤータイプ */
  senteType: Scalars['PlayerType']['output'];
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

/** メッセージコンテンツのUnion型 */
export type MessageContent = BestMoveContent | MarkdownContent;

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
  createMatch: Match;
  evaluateMatchState: EvaluateMatchStateResult;
  saveMatchStateAndGetCandidates: SaveMatchStateResult;
  sendChatMessage: SendChatMessageResult;
};


export type MutationCreateMatchArgs = {
  input: CreateMatchInput;
};


export type MutationEvaluateMatchStateArgs = {
  input: EvaluateMatchStateInput;
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



/** Mapping of union types */
export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = ResolversObject<{
  MessageContent:
    | ( BestMoveContent )
    | ( MarkdownContent )
  ;
}>;


/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  BestMoveContent: ResolverTypeWrapper<BestMoveContent>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  ChatMessage: ResolverTypeWrapper<Omit<ChatMessage, 'contents'> & { contents: Array<ResolversTypes['MessageContent']> }>;
  CreateMatchInput: CreateMatchInput;
  EvaluateMatchStateInput: EvaluateMatchStateInput;
  EvaluateMatchStateResult: ResolverTypeWrapper<Omit<EvaluateMatchStateResult, 'thinkingMessage'> & { thinkingMessage: ResolversTypes['ChatMessage'] }>;
  Health: ResolverTypeWrapper<Health>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  MarkdownContent: ResolverTypeWrapper<MarkdownContent>;
  Match: ResolverTypeWrapper<Match>;
  MatchState: ResolverTypeWrapper<MatchState>;
  MessageContent: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['MessageContent']>;
  MoveVariation: ResolverTypeWrapper<MoveVariation>;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  PlayerType: ResolverTypeWrapper<Scalars['PlayerType']['output']>;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  SaveMatchStateInput: SaveMatchStateInput;
  SaveMatchStateResult: ResolverTypeWrapper<SaveMatchStateResult>;
  SendChatMessageInput: SendChatMessageInput;
  SendChatMessageResult: ResolverTypeWrapper<Omit<SendChatMessageResult, 'assistantMessage' | 'userMessage'> & { assistantMessage: ResolversTypes['ChatMessage'], userMessage: ResolversTypes['ChatMessage'] }>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  BestMoveContent: BestMoveContent;
  Boolean: Scalars['Boolean']['output'];
  ChatMessage: Omit<ChatMessage, 'contents'> & { contents: Array<ResolversParentTypes['MessageContent']> };
  CreateMatchInput: CreateMatchInput;
  EvaluateMatchStateInput: EvaluateMatchStateInput;
  EvaluateMatchStateResult: Omit<EvaluateMatchStateResult, 'thinkingMessage'> & { thinkingMessage: ResolversParentTypes['ChatMessage'] };
  Health: Health;
  Int: Scalars['Int']['output'];
  MarkdownContent: MarkdownContent;
  Match: Match;
  MatchState: MatchState;
  MessageContent: ResolversUnionTypes<ResolversParentTypes>['MessageContent'];
  MoveVariation: MoveVariation;
  Mutation: Record<PropertyKey, never>;
  PlayerType: Scalars['PlayerType']['output'];
  Query: Record<PropertyKey, never>;
  SaveMatchStateInput: SaveMatchStateInput;
  SaveMatchStateResult: SaveMatchStateResult;
  SendChatMessageInput: SendChatMessageInput;
  SendChatMessageResult: Omit<SendChatMessageResult, 'assistantMessage' | 'userMessage'> & { assistantMessage: ResolversParentTypes['ChatMessage'], userMessage: ResolversParentTypes['ChatMessage'] };
  String: Scalars['String']['output'];
}>;

export type BestMoveContentResolvers<ContextType = any, ParentType extends ResolversParentTypes['BestMoveContent'] = ResolversParentTypes['BestMoveContent']> = ResolversObject<{
  bestmove?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  engineName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  timeMs?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  variations?: Resolver<Array<ResolversTypes['MoveVariation']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ChatMessageResolvers<ContextType = any, ParentType extends ResolversParentTypes['ChatMessage'] = ResolversParentTypes['ChatMessage']> = ResolversObject<{
  contents?: Resolver<Array<ResolversTypes['MessageContent']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  isPartial?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  matchId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type EvaluateMatchStateResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['EvaluateMatchStateResult'] = ResolversParentTypes['EvaluateMatchStateResult']> = ResolversObject<{
  matchStateId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  thinkingMessage?: Resolver<ResolversTypes['ChatMessage'], ParentType, ContextType>;
}>;

export type HealthResolvers<ContextType = any, ParentType extends ResolversParentTypes['Health'] = ResolversParentTypes['Health']> = ResolversObject<{
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type MarkdownContentResolvers<ContextType = any, ParentType extends ResolversParentTypes['MarkdownContent'] = ResolversParentTypes['MarkdownContent']> = ResolversObject<{
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MatchResolvers<ContextType = any, ParentType extends ResolversParentTypes['Match'] = ResolversParentTypes['Match']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  goteType?: Resolver<ResolversTypes['PlayerType'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  playerGote?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  playerSente?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  senteType?: Resolver<ResolversTypes['PlayerType'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type MatchStateResolvers<ContextType = any, ParentType extends ResolversParentTypes['MatchState'] = ResolversParentTypes['MatchState']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  index?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  matchId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  moveNotation?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  player?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  sfen?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  thinkingTime?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type MessageContentResolvers<ContextType = any, ParentType extends ResolversParentTypes['MessageContent'] = ResolversParentTypes['MessageContent']> = ResolversObject<{
  __resolveType: TypeResolveFn<'BestMoveContent' | 'MarkdownContent', ParentType, ContextType>;
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
  createMatch?: Resolver<ResolversTypes['Match'], ParentType, ContextType, RequireFields<MutationCreateMatchArgs, 'input'>>;
  evaluateMatchState?: Resolver<ResolversTypes['EvaluateMatchStateResult'], ParentType, ContextType, RequireFields<MutationEvaluateMatchStateArgs, 'input'>>;
  saveMatchStateAndGetCandidates?: Resolver<ResolversTypes['SaveMatchStateResult'], ParentType, ContextType, RequireFields<MutationSaveMatchStateAndGetCandidatesArgs, 'input'>>;
  sendChatMessage?: Resolver<ResolversTypes['SendChatMessageResult'], ParentType, ContextType, RequireFields<MutationSendChatMessageArgs, 'input'>>;
}>;

export interface PlayerTypeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['PlayerType'], any> {
  name: 'PlayerType';
}

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
  BestMoveContent?: BestMoveContentResolvers<ContextType>;
  ChatMessage?: ChatMessageResolvers<ContextType>;
  EvaluateMatchStateResult?: EvaluateMatchStateResultResolvers<ContextType>;
  Health?: HealthResolvers<ContextType>;
  MarkdownContent?: MarkdownContentResolvers<ContextType>;
  Match?: MatchResolvers<ContextType>;
  MatchState?: MatchStateResolvers<ContextType>;
  MessageContent?: MessageContentResolvers<ContextType>;
  MoveVariation?: MoveVariationResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  PlayerType?: GraphQLScalarType;
  Query?: QueryResolvers<ContextType>;
  SaveMatchStateResult?: SaveMatchStateResultResolvers<ContextType>;
  SendChatMessageResult?: SendChatMessageResultResolvers<ContextType>;
}>;

