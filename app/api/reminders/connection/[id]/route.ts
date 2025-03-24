import { getConnectionReminders } from '@/lib/reminders';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id) {
      return NextResponse.json({ error: 'Connection ID is required' }, { status: 400 });
    }
    
    const reminders = await getConnectionReminders(params.id);
    return NextResponse.json(reminders);
  } catch (error) {
    console.error(`Error fetching reminders for connection ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch reminders' }, { status: 500 });
  }
} 