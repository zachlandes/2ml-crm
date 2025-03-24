import { NextResponse } from 'next/server';
import { loadConnections } from '@/lib/connections';

export async function GET() {
  try {
    const connections = await loadConnections();
    return NextResponse.json({ success: true, count: connections.length, connections: connections.slice(0, 5) });
  } catch (error) {
    console.error('Error in test API:', error);
    return NextResponse.json({ success: false, error: 'Failed to load connections' }, { status: 500 });
  }
} 