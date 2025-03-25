import { NextResponse } from 'next/server';
import { getActionCounts } from '@/lib/actionTracker';

export async function GET() {
  try {
    const actions = await getActionCounts();
    return NextResponse.json({ success: true, actions });
  } catch (error) {
    console.error('Error getting actions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get actions' },
      { status: 500 }
    );
  }
} 