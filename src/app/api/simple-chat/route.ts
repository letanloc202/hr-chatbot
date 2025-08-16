import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";

export async function POST(req: Request) {
  try {
    const { prompt: input } = await req.json();

    // Check if OpenRouter API key is available
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "OPENROUTER_API_KEY environment variable is missing" },
        { status: 500 }
      );
    }

    const model = new ChatOpenAI({
      modelName: "openai/gpt-4o-mini",
      openAIApiKey: apiKey,
      configuration: {
        baseURL:
          process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
      },
      temperature: 0.7,
    });

    const prompt = ChatPromptTemplate.fromMessages([
      new SystemMessage("You're a helpful HR assistant"),
      new HumanMessage(input),
    ]);

    const parser = new StringOutputParser();
    const chain = prompt.pipe(model).pipe(parser);

    const result = await chain.invoke({});

    return Response.json(result);
  } catch (error) {
    console.error("Simple chat API error:", error);
    return Response.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
