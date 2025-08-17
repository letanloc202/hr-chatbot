import { ChatOpenAI } from "@langchain/openai";
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
} from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const OPENROUTER_BASE_URL =
  process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";

export function createChatModel(modelName: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  console.log("key", apiKey?.length);

  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY environment variable is missing or empty"
    );
  }

  return new ChatOpenAI({
    modelName,
    apiKey: apiKey,
    configuration: {
      baseURL: OPENROUTER_BASE_URL,
    },
    temperature: 0.7,
  });
}

export const SYSTEM_PROMPTS = {
  HR_ASSISTANT: `You are an HR assistant for a demo company. You help employees with HR-related questions and can process time-off requests.

Company Policies:
{policies}

User Information:
{user_info}

RESPONSE GUIDELINES:
- If the user requests time off, vacation, holiday, or mentions taking days off, respond with a professional and helpful message in Vietnamese that acknowledges their request and provides next steps.
- For general HR questions, provide helpful information based on company policies.
- Keep responses concise and helpful. ALWAYS RESPOND IN VIETNAMESE.
- Use newlines (\\n) to format your response for better readability.
- Return only the helpful response text, no JSON formatting, no markdown.
- Your response should be directly displayable in a chat interface.
- IMPORTANT: Do NOT use markdown syntax like **bold**, *italic*, # headers, or numbered lists with 1. 2. 3.
- Instead, use plain text with newlines (\\n) to separate sections and create structure.
- For lists, use simple text with newlines, not markdown formatting.`,

  LEAVE_PARSER: `Extract structured leave request information from the user's message. Return only valid JSON matching this schema:
{
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD", 
  "days": number,
  "type": "annual",
  "note": "user's request text"
}

Parse dates like "next Monday", "tomorrow", "next week", etc. into actual dates.`,
};

export async function getChatResponse(
  modelName: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  systemPrompt: string = SYSTEM_PROMPTS.HR_ASSISTANT,
  userInfo?: string,
  policies?: Array<{ title: string; description: string }>,
  currentUserMessage?: string
) {
  const model = createChatModel(modelName);

  // Use provided policies or fallback to fetching from API
  let policiesText = "No policies available";
  if (policies && policies.length > 0) {
    policiesText = policies
      .map((policy) => `- ${policy.title}: ${policy.description}`)
      .join("\n");
  } else {
    try {
      const policiesResponse = await fetch(
        `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/api/policies`
      );
      if (policiesResponse.ok) {
        const policiesData = await policiesResponse.json();
        if (policiesData.policies && policiesData.policies.length > 0) {
          policiesText = policiesData.policies
            .map(
              (policy: { title: string; description: string }) =>
                `- ${policy.title}: ${policy.description}`
            )
            .join("\n");
        }
      }
    } catch (error) {
      console.error("Failed to fetch policies:", error);
    }
  }

  // Replace placeholders with actual data
  const processedSystemPrompt = systemPrompt
    .replace("{policies}", policiesText)
    .replace("{user_info}", userInfo || "No user information available");

  // Create message array with proper types
  const messageArray = [
    new SystemMessage(processedSystemPrompt),
    ...messages.map((msg) =>
      msg.role === "user"
        ? new HumanMessage(msg.content)
        : new AIMessage(msg.content)
    ),
  ];

  // Add current user message if provided
  if (currentUserMessage) {
    messageArray.push(new HumanMessage(currentUserMessage));
  }

  const prompt = ChatPromptTemplate.fromMessages(messageArray);
  console.log("prompt", prompt);

  const parser = new StringOutputParser();
  const chain = prompt.pipe(model).pipe(parser);

  const result = await chain.invoke({});

  // Clean up any markdown syntax to ensure plaintext response
  const cleanResult = result
    .replace(/\*\*(.*?)\*\*/g, "$1") // Remove **bold**
    .replace(/\*(.*?)\*/g, "$1") // Remove *italic*
    .replace(/^#+\s+/gm, "") // Remove headers
    .replace(/^\d+\.\s+/gm, "") // Remove numbered list markers
    .replace(/^\-\s+/gm, "") // Remove bullet list markers
    .replace(/^\*\s+/gm, "") // Remove asterisk list markers
    .trim();

  // Check if the response indicates a time-off request
  const isTimeOffRequest =
    cleanResult.toLowerCase().includes("nghỉ phép") ||
    cleanResult.toLowerCase().includes("xin nghỉ") ||
    cleanResult.toLowerCase().includes("nghỉ việc") ||
    cleanResult.toLowerCase().includes("nghỉ lễ") ||
    cleanResult.toLowerCase().includes("nghỉ tết") ||
    cleanResult.toLowerCase().includes("nghỉ mát") ||
    cleanResult.toLowerCase().includes("nghỉ thai sản") ||
    cleanResult.toLowerCase().includes("nghỉ ốm");

  // Return the plaintext response with time-off detection
  return {
    response: cleanResult,
    is_need_time_off: isTimeOffRequest,
    reasoning: isTimeOffRequest
      ? "User requested time off based on response content"
      : "No time-off request detected",
  };
}
