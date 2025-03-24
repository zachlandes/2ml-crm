import { getOverdueReminders } from '@/lib/reminders';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const reminders = await getOverdueReminders();
    return NextResponse.json(reminders);
  } catch (error) {
    console.error('Error fetching overdue reminders:', error);
    return NextResponse.json({ error: 'Failed to fetch reminders' }, { status: 500 });
  }
} 