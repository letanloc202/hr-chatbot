import { NextRequest, NextResponse } from "next/server";
import { getChatResponse, SYSTEM_PROMPTS } from "@/lib/langchain";
import { readJsonFile, writeJsonFile, Message } from "@/lib/data";
import { z } from "zod";

const chatRequestSchema = z.object({
  message: z.string().min(1),
  model: z.string().min(1),
  userInfo: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, model, userInfo } = chatRequestSchema.parse(body);

    // Read existing messages
    const messages = await readJsonFile<Message[]>("messages.json");

    // Generate unique IDs using timestamp and random string
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substr(2, 9);
    const baseId = `msg_${timestamp}_${randomStr}`;

    // Add user message
    const userMessage: Message = {
      id: `${baseId}_user`,
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };

    messages.push(userMessage);

    // Get LLM response with user info
    const llmResponse = await getChatResponse(
      model,
      [userMessage],
      SYSTEM_PROMPTS.HR_ASSISTANT,
      userInfo
    );

    // Extract response and check if time off is needed
    let response = "I'm sorry, I couldn't process your request.";

    if (typeof llmResponse.response === "string") {
      response = llmResponse.response;
    } else if (typeof llmResponse === "string") {
      response = llmResponse;
    } else if (llmResponse && typeof llmResponse === "object") {
      response = llmResponse.response || JSON.stringify(llmResponse);
    }

    const isNeedTimeOff = llmResponse.is_need_time_off || false;

    // If time off is needed, process leave request
    if (isNeedTimeOff) {
      try {
        // Parse the leave request
        const parseResponse = await fetch(
          `${
            process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
          }/api/leave/parse`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, model }),
          }
        );

        if (parseResponse.ok) {
          const parsedData = await parseResponse.json();

          // Create the leave case
          const createResponse = await fetch(
            `${
              process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
            }/api/leave/create`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                startDate: parsedData.start_date,
                endDate: parsedData.end_date,
                days: parsedData.days,
                type: parsedData.type,
                note: parsedData.note,
              }),
            }
          );

          if (createResponse.ok) {
            // Add note about leave case creation
            const updatedResponse =
              response +
              "\n\nI've created a leave case for you. You'll receive a confirmation shortly.";

            // Add assistant message
            const assistantMessage: Message = {
              id: `${baseId}_assistant`,
              role: "assistant",
              content: updatedResponse,
              timestamp: new Date().toISOString(),
            };

            messages.push(assistantMessage);
          }
        }
      } catch (error) {
        console.error("Failed to process leave request:", error);
      }
    } else {
      // Add assistant message for regular response
      const assistantMessage: Message = {
        id: `${baseId}_assistant`,
        role: "assistant",
        content: response,
        timestamp: new Date().toISOString(),
      };

      messages.push(assistantMessage);
    }

    // Keep only last 50 messages
    if (messages.length > 50) {
      messages.splice(0, messages.length - 50);
    }

    // Save messages
    await writeJsonFile("messages.json", messages);

    return NextResponse.json({
      response,
      isNeedTimeOff,
      reasoning: llmResponse.reasoning || "No reasoning provided",
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
