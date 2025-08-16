import { NextResponse } from 'next/server';
import { readJsonFile } from '@/lib/data';

export async function GET() {
  try {
    const employee = await readJsonFile('employee.json');
    return NextResponse.json({ employee });
  } catch (error) {
    console.error('Employee fetch API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee data' },
      { status: 500 }
    );
  }
}
