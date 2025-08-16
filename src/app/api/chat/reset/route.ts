import { NextResponse } from "next/server";
import { writeJsonFile } from "@/lib/data";

export async function POST() {
  try {
    // Reset to initial welcome message
    const initialMessages = [
      {
        id: "msg_1",
        role: "assistant",
        content:
          "Xin chào! Tôi là trợ lý nhân sự của bạn. Tôi có thể giúp gì cho bạn hôm nay?",
        timestamp: new Date().toISOString(),
      },
    ];

    await writeJsonFile("messages.json", initialMessages);

    return NextResponse.json({ message: "Chat reset successfully" });
  } catch (error) {
    console.error("Chat reset API error:", error);
    return NextResponse.json(
      { error: "Failed to reset chat" },
      { status: 500 }
    );
  }
}
