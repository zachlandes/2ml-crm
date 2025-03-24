'use client';

import React from 'react';
import { Message } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

interface MessageHistoryProps {
  messages: Message[];
}

export default function MessageHistory({ messages }: MessageHistoryProps) {
  if (messages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Message History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No messages yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Message History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="border rounded-md p-4">
              <div className="flex justify-between mb-2">
                <span className="font-medium">
                  {message.template === 'aca' ? 'ACA Template' : 'Custom Message'}
                </span>
                <span className="text-sm text-muted-foreground">
                  {message.sentAt 
                    ? `Sent ${formatDistanceToNow(new Date(message.sentAt))} ago` 
                    : `Draft - ${message.status}`}
                </span>
              </div>
              <div className="whitespace-pre-wrap text-sm">{message.content}</div>
              
              {message.template === 'aca' && message.metadata && (
                <div className="mt-4 pt-2 border-t text-sm">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className="font-medium">Acknowledge</p>
                      <p className="text-muted-foreground">{message.metadata.acknowledgment}</p>
                    </div>
                    <div>
                      <p className="font-medium">Compliment</p>
                      <p className="text-muted-foreground">{message.metadata.compliment}</p>
                    </div>
                    <div>
                      <p className="font-medium">Ask</p>
                      <p className="text-muted-foreground">{message.metadata.ask}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 