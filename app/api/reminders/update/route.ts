import { updateReminder } from '@/lib/reminders';
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  try {
    const { id, updates } = await request.json();
    
    if (!id || !updates) {
      return NextResponse.json(
        { error: 'Reminder ID and updates are required' },
        { status: 400 }
      );
    }
    
    await updateReminder(id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating reminder:', error);
    return NextResponse.json({ error: 'Failed to update reminder' }, { status: 500 });
  }
} 