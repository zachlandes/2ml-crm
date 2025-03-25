import { NextRequest, NextResponse } from 'next/server';
import { markMessageAsSent } from '@/lib/messages';

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Message ID is required' },
        { status: 400 }
      );
    }
    
    const message = await markMessageAsSent(id);
    
    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Failed to mark message as sent' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message,
      notification: {
        type: 'message_sent',
        message: 'Message marked as sent'
      }
    });
  } catch (error) {
    console.error('Error marking message as sent:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark message as sent' },
      { status: 500 }
    );
  }
} 