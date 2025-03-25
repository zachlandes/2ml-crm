'use client';

import { useState } from 'react';
import { useNotifications } from './ActionNotification';
import { ActionType } from '@/lib/actionTracker';

interface MessageActionsProps {
  messageId: string;
  status: string;
}

export function MessageActions({ messageId, status }: MessageActionsProps) {
  const [isSending, setIsSending] = useState(false);
  const { addNotification } = useNotifications();
  
  const handleMarkAsSent = async () => {
    if (status === 'sent') return;
    
    setIsSending(true);
    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: messageId }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Show notification
        addNotification(
          data.notification.type as ActionType,
          data.notification.message
        );
      }
    } catch (error) {
      console.error('Error marking message as sent:', error);
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div className="flex gap-2">
      {status === 'draft' && (
        <button
          onClick={handleMarkAsSent}
          disabled={isSending}
          className="text-xs px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isSending ? 'Sending...' : 'Mark as Sent'}
        </button>
      )}
    </div>
  );
} 