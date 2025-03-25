import { NextRequest, NextResponse } from 'next/server';
import { deleteNote } from '@/lib/connections';

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Note ID is required' },
        { status: 400 }
      );
    }
    
    const success = await deleteNote(id);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete note' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete note' },
      { status: 500 }
    );
  }
} 