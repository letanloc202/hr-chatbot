import { NextRequest, NextResponse } from "next/server";
import { createChatModel } from "@/lib/langchain";
import { z } from "zod";

const getHelloRequestSchema = z.object({
  user_info: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_info } = getHelloRequestSchema.parse(body);

    const model = createChatModel("openai/gpt-4o-mini");

    const systemPrompt = `You are a friendly HR chatbot. Generate a casual, warm greeting message for the user based on their profile information. 

Keep it conversational and natural - like how a friendly colleague would greet someone. No formal business language, no company signatures, just a simple friendly message in Vietnamese.

User information: {user_info}`;

    const prompt = `Generate a personalized greeting message based on the user's profile information.`;

    const response = await model.invoke([
      {
        role: "system",
        content: systemPrompt.replace("{user_info}", user_info),
      },
      { role: "user", content: prompt },
    ]);

    return NextResponse.json({
      greeting: response.content,
    });
  } catch (error) {
    console.error("Get Hello API error:", error);
    return NextResponse.json(
      { error: "Failed to generate greeting message" },
      { status: 500 }
    );
  }
}
