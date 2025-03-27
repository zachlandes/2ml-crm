import { NextRequest, NextResponse } from 'next/server';
import { getConnection, updateConnectionStatus } from '@/lib/connections';

// GET /api/connections/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const connection = await getConnection(params.id);
    
    if (!connection) {
      return NextResponse.json(
        { error: 'Connection not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(connection);
  } catch (error) {
    console.error('Error fetching connection:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/connections/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    let result;
    
    // Handle different update types
    if (data.status) {
      result = await updateConnectionStatus(params.id, data.status);
      
      return NextResponse.json({
        connection: result.connection,
        clearedReminders: result.clearedReminders
      });
    }
    
    // If no valid update type was specified
    return NextResponse.json(
      { error: 'Invalid update data' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating connection:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 