import { ChatOpenAI } from "@langchain/openai";
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
} from "@langchain/core/messages";
import {
  JsonOutputParser,
  StringOutputParser,
} from "@langchain/core/output_parsers";
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

QUAN TRỌNG: Bạn phải trả lời bằng JSON hợp lệ theo định dạng chính xác này:
{
  "response": "câu trả lời hữu ích cho người dùng",
  "is_need_time_off": true/false,
  "reasoning": "giải thích ngắn gọn tại sao is_need_time_off là true hoặc false"
}

HƯỚNG DẪN TRẢ LỜI:
- Nếu người dùng yêu cầu nghỉ phép, nghỉ lễ, nghỉ mát hoặc đề cập đến việc nghỉ ngày, đặt is_need_time_off thành true.
- Đối với yêu cầu nghỉ phép, trả lời bằng: "Cảm ơn bạn đã gửi yêu cầu nghỉ phép. Tôi đã ghi lại thông tin của bạn và gửi để phê duyệt. Bạn sẽ nhận được xác nhận từ người giám sát trong vòng 2-3 ngày làm việc. Vui lòng kiểm tra email để cập nhật."
- Đối với câu hỏi nhân sự chung, đặt is_need_time_off thành false và cung cấp thông tin hữu ích dựa trên chính sách công ty.
- Giữ câu trả lời ngắn gọn và hữu ích. LUÔN LUÔN TRẢ LỜI BẰNG TIẾNG VIỆT.
`,

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

  const parser = new JsonOutputParser();
  const chain = prompt.pipe(model).pipe(parser);

  const result = await chain.invoke({});
  const response = result.response;
  const is_need_time_off = result.is_need_time_off;
  const reasoning = result.reasoning;

  console.log("result", result);

  // Clean up any markdown syntax to ensure plaintext response
  const cleanResult = response
    .replace(/\*\*(.*?)\*\*/g, "$1") // Remove **bold**
    .replace(/\*(.*?)\*/g, "$1") // Remove *italic*
    .replace(/^#+\s+/gm, "") // Remove headers
    .replace(/^\d+\.\s+/gm, "") // Remove numbered list markers
    .replace(/^\-\s+/gm, "") // Remove bullet list markers
    .replace(/^\*\s+/gm, "") // Remove asterisk list markers
    .trim();

  // Return the plaintext response with time-off detection
  return {
    response: cleanResult,
    is_need_time_off: is_need_time_off,
    reasoning: reasoning,
  };
}
