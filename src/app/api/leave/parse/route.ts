import { NextRequest, NextResponse } from 'next/server';
import { getChatResponse, SYSTEM_PROMPTS } from '@/lib/langchain';
import { z } from 'zod';

const leaveRequestSchema = z.object({
  message: z.string().min(1),
  model: z.string().min(1),
});

const leaveCaseSchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  days: z.number().positive(),
  type: z.literal('annual'),
  note: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, model } = leaveRequestSchema.parse(body);

    // Use LangChain to parse the leave request
    const response = await getChatResponse(model, [
      { role: 'user', content: message }
    ], SYSTEM_PROMPTS.LEAVE_PARSER);

    // Try to extract JSON from the response
    let parsedData;
    try {
      // Look for JSON in the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse LLM response:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse leave request' },
        { status: 400 }
      );
    }

    // Validate the parsed data
    const validatedData = leaveCaseSchema.parse(parsedData);

    return NextResponse.json(validatedData);
  } catch (error) {
    console.error('Leave parse API error:', error);
    return NextResponse.json(
      { error: 'Failed to parse leave request' },
      { status: 500 }
    );
  }
}
