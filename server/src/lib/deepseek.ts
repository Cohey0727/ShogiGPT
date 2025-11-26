import { formatMoveToJapanese, sfenToBoard, applyUsiMove } from "../shared/services";
import type { Board } from "../shared/consts/shogi";
import { analyzeMateTags, analyzeMoveTags } from "../services/analyzeMoveTags";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

interface DeepSeekMessage {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: {
      name: string;
      arguments: string;
    };
  }>;
  tool_call_id?: string;
  name?: string;
}

interface DeepSeekTool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

interface DeepSeekRequest {
  model: string;
  messages: DeepSeekMessage[];
  temperature?: number;
  max_tokens?: number;
  tools?: DeepSeekTool[];
  tool_choice?: "auto" | "none";
}

interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string | null;
      tool_calls?: Array<{
        id: string;
        type: "function";
        function: {
          name: string;
          arguments: string;
        };
      }>;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface MoveVariation {
  move: string;
  scoreCp: number | null | undefined;
  scoreMate: number | null | undefined;
  depth: number;
  nodes: number | null | undefined;
  pv: string[] | null | undefined;
}

interface GenerateChatResponseOptions {
  userMessage: string;
  conversationHistory?: DeepSeekMessage[];
  tools?: DeepSeekTool[];
  onToolCall?: (toolName: string, toolArgs: unknown) => Promise<string | Record<string, unknown>>;
  maxIterations?: number;
}

const chatSystemPrompt = `あなたは将棋の対局をサポートするAIアシスタントです。

重要な原則：
1. 将棋に関する質問や指示には、必ず利用可能なツールを使用してください
2. ツールを使わずに推測や想像で候補手を答えることは禁止です
3. ユーザーが指し手を指示した場合は、必ずmake_moveツールで実際に盤面を更新してください
4. 挨拶や雑談など、将棋に関係ない会話には自然に応答してください（ツール不要）

ユーザーの質問に対して、親切で分かりやすく回答してください。`;

export async function generateChatResponse(
  optionsOrMessage: GenerateChatResponseOptions | string,
  conversationHistory: DeepSeekMessage[] = [],
): Promise<string> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY is not set");
  }

  // オーバーロード対応：引数の正規化
  const options: GenerateChatResponseOptions =
    typeof optionsOrMessage === "string"
      ? { userMessage: optionsOrMessage, conversationHistory }
      : optionsOrMessage;

  const {
    userMessage,
    conversationHistory: history = [],
    tools = [],
    onToolCall,
    maxIterations = 5,
  } = options;

  const messages: DeepSeekMessage[] = [
    {
      role: "system",
      content: chatSystemPrompt,
    },
    ...history,
    {
      role: "user",
      content: userMessage,
    },
  ];

  // Function Callingのループ（最大maxIterations回）
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    const requestBody: DeepSeekRequest = {
      model: "deepseek-chat",
      messages,
      temperature: 0.7,
      max_tokens: 1000,
      ...(tools.length > 0 ? { tools, tool_choice: "auto" } : {}),
    };

    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `DeepSeek API error: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    const data = (await response.json()) as DeepSeekResponse;
    const choice = data.choices[0];

    if (!choice) {
      throw new Error("No response from DeepSeek API");
    }

    const { message, finish_reason } = choice;

    // ツール呼び出しがある場合
    if (finish_reason === "tool_calls" && message.tool_calls && onToolCall) {
      // アシスタントメッセージを履歴に追加
      messages.push({
        role: "assistant",
        content: message.content ?? "",
        tool_calls: message.tool_calls,
      });

      // 各ツールを実行
      for (const toolCall of message.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);

        console.log(`🔧 Tool called: ${toolName} with args:`, JSON.stringify(toolArgs, null, 2));

        try {
          const toolResult = await onToolCall(toolName, toolArgs);
          const toolResultString =
            typeof toolResult === "string" ? toolResult : JSON.stringify(toolResult, null, 2);

          // ツール結果を履歴に追加
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            name: toolName,
            content: toolResultString,
          });
        } catch (error) {
          console.error(`❌ Tool execution failed:`, error);
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            name: toolName,
            content: `エラー: ${error instanceof Error ? error.message : String(error)}`,
          });
        }
      }

      // 次のイテレーションでツール結果を含めて再度APIを呼び出す
      continue;
    }

    // 通常の応答
    const assistantMessage = message.content;
    if (!assistantMessage) {
      throw new Error("No content in assistant message");
    }

    return assistantMessage;
  }

  throw new Error(`Max iterations (${maxIterations}) reached in function calling loop`);
}

/**
 * 将棋の局面解析結果から人間らしい解説Markdownを生成
 */
export async function generateBestMoveCommentary(params: {
  sfen: string;
  bestmove: string;
  variations: MoveVariation[];
  engineName: string;
  timeMs: number;
  previousEvaluation?: number | null;
  currentEvaluation?: number | null;
}): Promise<string> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY is not set");
  }

  const { sfen, bestmove, variations } = params;
  // engineName, timeMsは対局者視点では使用しない

  // 盤面情報を取得（駒名を表示するため）
  let board: Board | undefined;
  try {
    board = sfenToBoard(sfen);
  } catch (error) {
    console.error("Failed to parse SFEN:", error);
    // 盤面解析に失敗しても、駒名なしで続行
  }

  // bestmoveも日本語に変換（駒名付き）
  const bestmoveJp = formatMoveToJapanese(bestmove, board);

  // bestmoveの読み筋から戦略を分析（盤面を1手ずつ更新しながら）
  const topVariation = variations[0];
  let strategyHint = "";

  if (topVariation?.pv && topVariation.pv.length > 0 && board) {
    try {
      let beforeBoard = board;
      const perspective = board.turn;
      const pvLines: string[] = [];

      // すべての読み筋を処理（indexが偶数=自分、奇数=相手）
      topVariation.pv.forEach((usiMove, index) => {
        const moveLabel = formatMoveToJapanese(usiMove, beforeBoard);
        const player = perspective === beforeBoard.turn ? "自分" : "相手";
        const afterBoard = applyUsiMove(beforeBoard, usiMove);
        // 各手の戦術特徴を分析
        const tacticalTags = analyzeMoveTags({
          beforeBoard,
          afterBoard,
          usiMove,
          perspective,
        });
        const mateTags = analyzeMateTags({
          beforeBoard,
          afterBoard,
          usiMove,
          perspective,
        });
        const allTags = [...mateTags, ...tacticalTags];

        // タグを含めて1手ごとに表示
        let moveDescription = `${index + 1}. ${player}: ${moveLabel}`;
        if (allTags.length > 0) {
          moveDescription += ` [${allTags.join("、")}]`;
        }

        beforeBoard = afterBoard;
        pvLines.push(moveDescription);
      });
      strategyHint = `${pvLines.join("\n")}`;
    } catch (error) {
      console.error("Failed to parse PV:", error);
      // エラー時は読み筋なしで続行
    }
  }

  // 評価値から局面の状況を判断
  const topScore = variations[0]?.scoreCp ?? 0;

  // 評価値を100点満点に正規化（50点が互角、0点=後手めちゃくちゃ有利、100点=先手めちゃくちゃ有利）
  const normalizedScore = Math.min(100, Math.max(0, Math.round(topScore / 20) + 50));

  let situation = "";
  if (normalizedScore >= 45 && normalizedScore <= 55) {
    situation = "互角の局面";
  } else if (normalizedScore > 55) {
    situation = normalizedScore > 75 ? "先手優勢" : "先手がやや有利";
  } else {
    situation = normalizedScore < 25 ? "後手優勢" : "後手がやや有利";
  }

  // 評価値の変化を分析
  let evaluationChange = "";
  if (
    params.previousEvaluation !== undefined &&
    params.previousEvaluation !== null &&
    params.currentEvaluation !== undefined &&
    params.currentEvaluation !== null
  ) {
    const diff = params.currentEvaluation - params.previousEvaluation;
    const absDiff = Math.abs(diff);

    if (absDiff < 50) {
      evaluationChange = "ほぼ変化なし";
    } else if (diff > 0) {
      // 先手に有利な変化
      if (absDiff > 300) {
        evaluationChange = "先手が大きく有利になりました";
      } else if (absDiff > 150) {
        evaluationChange = "先手が有利になりました";
      } else {
        evaluationChange = "先手がやや有利になりました";
      }
    } else {
      // 後手に有利な変化
      if (absDiff > 300) {
        evaluationChange = "後手が大きく有利になりました";
      } else if (absDiff > 150) {
        evaluationChange = "後手が有利になりました";
      } else {
        evaluationChange = "後手がやや有利になりました";
      }
    }
    evaluationChange = `\n前の局面と比較して: ${evaluationChange}（評価値変化: ${
      diff > 0 ? "+" : ""
    }${diff}）`;
  }

  const prompt = `# あなたは将棋の対局者です。今この局面で次の一手を考えています。

## 現在の状況: ${situation}（評価値: ${normalizedScore}点/100点満点、50点=互角、100点=先手めちゃくちゃ有利、0点=後手めちゃくちゃ有利）${evaluationChange}

## 最善手は「${bestmoveJp}」です。

## 【読み筋の流れ】
${strategyHint}

## **厳守事項**:
- []内のタグを解説に活用して説明に組み込んでください。[]自体は表示しないでください。
- []内のタグは、打ち手視点での挙動です。相手:[歩を取る] → 自分の歩を取られる、のように解釈してください。
- ()カッコ内は、元々いた駒の位置です。
- 上記の読み筋とタグの連携を重視してください。
- 評価値の大きな変化がある場合は、その戦況変化を踏まえて解説してください
- **絶対厳守**: 詰みがある場合は必ず詰みを最優先に話題の中心にしてください。勝利、敗北の宣言を必ず行うこと。
- **絶対厳守**: 読み筋に含まれていない手を一切言及しないこと（想定される手、考えられる手なども一切言及禁止）
- **絶対厳守**: タグに含まれていない用語は絶対に使わないこと（例: 「角道を開ける」というタグがない場合は「角道を開ける」という言葉を使わない）
- 自分の手と相手の手を正確に区別すること
- 読み筋の展開を見据えて、この手の狙いを説明
- 相手の応手とそれに対する自分の対応を言及
- 主観的な表現（「〜と思います」「〜を狙います」「〜を取ります」）を使う
- 歩を進める場合は、「歩を突く」といいます、桂を進める場合は「桂を跳ねる」といいます
- 300文字以内、簡潔に`;

  const systemPrompt = `あなたは将棋の対局者です。対局中に自分の考えを語る時は、一人称で主観的に話します。「〜と思います」「〜したいです」「〜が気になります」など、対局者の心情や判断を自然に表現してください。 適当な解説ではなく、userの読み筋を適切に反映した、具体的で正確な解説を行ってください。`;
  console.log(prompt);
  const messages: DeepSeekMessage[] = [
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content: prompt,
    },
  ];

  const requestBody: DeepSeekRequest = {
    model: "deepseek-chat",
    messages,
    temperature: 0.0, // ランダム性を完全に排除し、決定論的な出力にする
    max_tokens: 400,
  };

  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = (await response.json()) as DeepSeekResponse;

  const commentary = data.choices[0]?.message?.content;
  if (!commentary) {
    throw new Error("No commentary generated from DeepSeek API");
  }

  return commentary.trim();
}
