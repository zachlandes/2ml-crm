import { createReminder } from '@/lib/reminders';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { connectionId, title, dueDate, description } = await request.json();
    
    if (!connectionId || !title || !dueDate) {
      return NextResponse.json(
        { error: 'Connection ID, title and due date are required' },
        { status: 400 }
      );
    }
    
    const reminder = await createReminder(connectionId, title, dueDate, description);
    return NextResponse.json(reminder);
  } catch (error) {
    console.error('Error creating reminder:', error);
    return NextResponse.json({ error: 'Failed to create reminder' }, { status: 500 });
  }
} 