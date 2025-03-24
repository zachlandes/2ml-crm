import { completeReminder } from '@/lib/reminders';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Reminder ID is required' }, { status: 400 });
    }
    
    await completeReminder(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error completing reminder:', error);
    return NextResponse.json({ error: 'Failed to complete reminder' }, { status: 500 });
  }
} 