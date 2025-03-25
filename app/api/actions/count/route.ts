import { NextResponse } from 'next/server';
import { getTotalActionCount } from '@/lib/actionTracker';

export async function GET() {
  try {
    const total = await getTotalActionCount();
    return NextResponse.json({ success: true, total });
  } catch (error) {
    console.error('Error getting total action count:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get total action count' },
      { status: 500 }
    );
  }
} 