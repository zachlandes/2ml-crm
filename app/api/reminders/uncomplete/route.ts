import { uncompleteReminder } from '@/lib/reminders';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Reminder ID is required' }, { status: 400 });
    }
    
    await uncompleteReminder(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error uncompleting reminder:', error);
    return NextResponse.json({ error: 'Failed to uncomplete reminder' }, { status: 500 });
  }
} 