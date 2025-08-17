import { NextRequest, NextResponse } from "next/server";
import { getChatResponse, SYSTEM_PROMPTS } from "@/lib/langchain";
import { z } from "zod";

const chatRequestSchema = z.object({
  message: z.string().min(1),
  model: z.string().min(1),
  history_chat: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ),
  user_info: z.string(),
  policies: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
    })
  ),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, model, history_chat, user_info, policies } =
      chatRequestSchema.parse(body);

    // Get LLM response with all the context
    const llmResponse = await getChatResponse(
      model,
      history_chat,
      SYSTEM_PROMPTS.HR_ASSISTANT,
      user_info,
      policies,
      message
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

    // Ensure newlines are preserved for proper display
    response = response.replace(/\\n/g, "\n");

    const isNeedTimeOff = llmResponse.is_need_time_off || false;

    // If time off is needed, process leave request
    if (isNeedTimeOff) {
      // TODO: Implement leave processing when API endpoints are ready
      console.log(
        "Time off request detected, but leave processing not yet implemented"
      );

      // Commented out until leave API endpoints are implemented
      /*
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
            response = response;
          }
        }
      } catch (error) {
        console.error("Failed to process leave request:", error);
      }
      */
    }

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
