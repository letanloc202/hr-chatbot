import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
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
  HR_ASSISTANT: `Bạn là trợ lý nhân sự cho một công ty demo. Bạn giúp nhân viên với các câu hỏi liên quan đến nhân sự và có thể xử lý yêu cầu nghỉ phép.

Chính sách công ty:
{policies}

Thông tin người dùng:
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
- Giữ câu trả lời ngắn gọn và hữu ích. LUÔN LUÔN TRẢ LỜI BẰNG TIẾNG VIỆT.`,

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
  userInfo?: string
) {
  const model = createChatModel(modelName);

  // Fetch policies
  let policiesText = "No policies available";
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

  // Replace placeholders with actual data
  const processedSystemPrompt = systemPrompt
    .replace("{policies}", policiesText)
    .replace("{user_info}", userInfo || "No user information available");

  const prompt = ChatPromptTemplate.fromMessages([
    new SystemMessage(processedSystemPrompt),
    ...messages.map((msg) =>
      msg.role === "user"
        ? new HumanMessage(msg.content)
        : new HumanMessage(msg.content)
    ),
  ]);

  const parser = new StringOutputParser();
  const chain = prompt.pipe(model).pipe(parser);

  const result = await chain.invoke({});

  // Try to parse JSON response
  try {
    const jsonResult = JSON.parse(result);
    // Ensure we have the expected structure
    if (typeof jsonResult === "object" && jsonResult !== null) {
      return {
        response: jsonResult.response || result,
        is_need_time_off: jsonResult.is_need_time_off || false,
        reasoning: jsonResult.reasoning || "No reasoning provided",
      };
    } else {
      throw new Error("Invalid JSON structure");
    }
  } catch (error) {
    // If JSON parsing fails, return a fallback response
    console.error("Failed to parse JSON response:", error);
    return {
      response: result,
      is_need_time_off: false,
      reasoning: "Could not determine if time off is needed",
    };
  }
}
