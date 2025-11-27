const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

/**
 * DeepSeek APIのメッセージ型
 */
export interface DeepSeekMessage {
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
  systemPrompt: string;
  conversationHistory?: DeepSeekMessage[];
  tools?: DeepSeekTool[];
  /**
   * ツール呼び出し時のコールバック
   *
   * @param toolName - 呼び出されたツール名
   * @param toolArgs - ツールの引数
   * @param messages - 現在のメッセージ履歴（読み取り専用として扱う）
   * @returns
   *   - string: ツール結果をLLMにフィードバック
   *   - DeepSeekMessage[]: メッセージを上書き
   *   - void/undefined: Handoff（LLMへのフィードバックを終了し、処理を他に委譲）
   */
  onToolCall?: (
    toolName: string,
    toolArgs: unknown,
    messages: DeepSeekMessage[],
  ) => Promise<string | void>;
  maxIterations?: number;
}

/**
 * generateChatResponse の結果型
 */
export type GenerateChatResponseResult = { type: "message"; message: string } | { type: "handoff" };

/**
 * DeepSeek APIを使用してチャット応答を生成する
 *
 * @param options - チャット応答生成のオプション
 * @returns 生成されたAI応答、または handoff の場合は { type: "handoff" }
 */
export async function generateChatResponse(
  options: GenerateChatResponseOptions,
): Promise<GenerateChatResponseResult> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY is not set");
  }

  const {
    userMessage,
    systemPrompt,
    conversationHistory: history = [],
    tools = [],
    onToolCall,
    maxIterations = 5,
  } = options;

  const messages: DeepSeekMessage[] = [
    {
      role: "system",
      content: systemPrompt,
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
          const toolResult = await onToolCall(toolName, toolArgs, messages);

          // Handoff: undefined の場合、LLMへのフィードバックを終了
          if (toolResult === undefined) {
            console.log(`🔀 Handoff: Tool "${toolName}" completed, exiting LLM loop`);
            return { type: "handoff" };
          }

          // Inline: string の場合、ツール結果を履歴に追加
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            name: toolName,
            content: toolResult,
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

    return { type: "message", message: assistantMessage };
  }

  throw new Error(`Max iterations (${maxIterations}) reached in function calling loop`);
}
