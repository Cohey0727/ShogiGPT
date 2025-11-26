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
3. 「角道を開ける」「美濃囲い」など、将棋用語を使う場合は、ツールの結果で得た情報に基づいて正確に使用してください
4. ユーザーが指し手を指示した場合は、必ずmove_and_evaluateツールで実際に盤面を更新してください
5. 挨拶や雑談など、将棋に関係ない会話には自然に応答してください（ツール不要）

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
      temperature: 0.2,
      max_tokens: 1500,
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
