import { NextResponse } from 'next/server';
import { readJsonFile } from '@/lib/data';

export async function GET() {
  try {
    const messages = await readJsonFile('messages.json');
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Messages fetch API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
