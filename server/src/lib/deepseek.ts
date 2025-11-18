const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

interface DeepSeekMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface DeepSeekRequest {
  model: string;
  messages: DeepSeekMessage[];
  temperature?: number;
  max_tokens?: number;
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
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function generateChatResponse(
  userMessage: string,
  conversationHistory: DeepSeekMessage[] = []
): Promise<string> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY is not set");
  }

  const messages: DeepSeekMessage[] = [
    {
      role: "system",
      content:
        "あなたは将棋の対局をサポートするAIアシスタントです。ユーザーの質問に対して、親切で分かりやすく回答してください。",
    },
    ...conversationHistory,
    {
      role: "user",
      content: userMessage,
    },
  ];

  const requestBody: DeepSeekRequest = {
    model: "deepseek-chat",
    messages,
    temperature: 0.7,
    max_tokens: 1000,
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
      `DeepSeek API error: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  const data = (await response.json()) as DeepSeekResponse;

  const assistantMessage = data.choices[0]?.message?.content;
  if (!assistantMessage) {
    throw new Error("No response from DeepSeek API");
  }

  return assistantMessage;
}
