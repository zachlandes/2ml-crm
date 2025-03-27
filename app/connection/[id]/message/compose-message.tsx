'use client';

import { useState } from 'react';
import { createAcaMessage, composeCustomMessage } from '@/lib/message-templates';
import { markMessageAsSent } from '@/lib/messages';
import { Connection } from '@/lib/types';
import { addConnectionNote } from '@/lib/connections';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ComposeMessageProps {
  connection: Connection;
}

export default function ComposeMessage({ connection }: ComposeMessageProps) {
  const router = useRouter();
  const [messageType, setMessageType] = useState<'aca' | 'custom'>('aca');
  const [acknowledgment, setAcknowledgment] = useState('');
  const [compliment, setCompliment] = useState('');
  const [ask, setAsk] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [previewMessage, setPreviewMessage] = useState('');
  const [messageId, setMessageId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  
  // Function to generate the preview message
  const generatePreview = async () => {
    let message;
    if (messageType === 'aca') {
      message = await createAcaMessage(connection.id, acknowledgment, compliment, ask);
    } else {
      message = await composeCustomMessage(connection.id, customMessage);
    }
    
    setPreviewMessage(message.content);
    setMessageId(message.id);
  };
  
  // Function to send the message
  const sendMessage = async () => {
    if (!messageId) return;
    
    setSending(true);
    try {
      // Mark the message as sent
      const sentMessage = await markMessageAsSent(messageId);
      
      if (sentMessage) {
        // Add a note about sending the message
        await addConnectionNote(
          connection.id,
          `Sent message: ${sentMessage.content.substring(0, 50)}...`,
          'message_sent'
        );
        
        setSent(true);
        setMessageId(null);
        setPreviewMessage('');
        // Reset form based on message type
        if (messageType === 'aca') {
          setAcknowledgment('');
          setCompliment('');
          setAsk('');
        } else {
          setCustomMessage('');
        }
        // Refresh the router to ensure connection page shows updated data
        router.refresh();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };
  
  return (
    <div className="flex flex-col space-y-6 py-4">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Compose a Message</h2>
        <p className="text-gray-600">
          Write a message to {connection.firstName} {connection.lastName}
        </p>
      </div>
      
      <div className="flex space-x-4">
        <button
          className={`px-4 py-2 rounded-md ${
            messageType === 'aca' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-800'
          }`}
          onClick={() => setMessageType('aca')}
        >
          ACA Format
        </button>
        <button
          className={`px-4 py-2 rounded-md ${
            messageType === 'custom' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-800'
          }`}
          onClick={() => setMessageType('custom')}
        >
          Custom Message
        </button>
      </div>
      
      {messageType === 'aca' ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block font-medium">
              Acknowledgment <span className="text-gray-500">(How you know them or reference point)</span>
            </label>
            <textarea
              className="w-full p-2 border rounded-md"
              value={acknowledgment}
              onChange={(e) => setAcknowledgment(e.target.value)}
              rows={2}
              placeholder="Example: I noticed we're both connected to Sarah Smith..."
            />
          </div>
          
          <div className="space-y-2">
            <label className="block font-medium">
              Compliment <span className="text-gray-500">(Something genuine about their work or profile)</span>
            </label>
            <textarea
              className="w-full p-2 border rounded-md"
              value={compliment}
              onChange={(e) => setCompliment(e.target.value)}
              rows={2}
              placeholder="Example: I was impressed by your recent article about..."
            />
          </div>
          
          <div className="space-y-2">
            <label className="block font-medium">
              Ask <span className="text-gray-500">(Your ask or question to engage them)</span>
            </label>
            <textarea
              className="w-full p-2 border rounded-md"
              value={ask}
              onChange={(e) => setAsk(e.target.value)}
              rows={2}
              placeholder="Example: I'd love to hear your thoughts on..."
            />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <label className="block font-medium">Custom Message</label>
          <textarea
            className="w-full p-2 border rounded-md"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            rows={6}
            placeholder="Write your custom message here..."
          />
        </div>
      )}
      
      <div className="flex space-x-4">
        <button
          className="px-4 py-2 bg-gray-800 text-white rounded-md"
          onClick={generatePreview}
          disabled={
            messageType === 'aca'
              ? !acknowledgment || !compliment || !ask
              : !customMessage
          }
        >
          Generate Preview
        </button>
      </div>
      
      {previewMessage && (
        <div className="space-y-4">
          <div className="p-4 bg-gray-100 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Message Preview:</h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(previewMessage);
                }}
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
                Copy
              </button>
            </div>
            <div className="whitespace-pre-wrap">{previewMessage}</div>
          </div>
          
          <div className="flex space-x-4">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
              onClick={sendMessage}
              disabled={sending}
            >
              {sending ? 'Sending...' : 'Mark as Sent'}
            </button>
          </div>
        </div>
      )}
      
      {sent && (
        <div className="space-y-4">
          <div className="p-4 bg-green-100 text-green-800 rounded-md">
            Message marked as sent! This would normally send through LinkedIn or email, but for demo purposes, 
            it's being tracked in your CRM history only.
          </div>
          
          <div className="flex space-x-4">
            <Link
              href="/"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Back to Home
            </Link>
            
            <button
              onClick={async () => {
                // Calculate date 5 business days from now
                const dueDate = new Date();
                let businessDays = 5;
                while (businessDays > 0) {
                  dueDate.setDate(dueDate.getDate() + 1);
                  if (dueDate.getDay() !== 0 && dueDate.getDay() !== 6) {
                    businessDays--;
                  }
                }
                
                try {
                  await fetch('/api/reminders/add', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      connectionId: connection.id,
                      title: `Follow up with ${connection.firstName} ${connection.lastName}`,
                      description: `Follow up on the message sent on ${new Date().toLocaleDateString()}`,
                      dueDate: dueDate.toISOString().split('T')[0]
                    }),
                  });
                  
                  // Show confirmation
                  alert('Follow-up reminder set for ' + dueDate.toLocaleDateString());
                } catch (error) {
                  console.error('Error setting reminder:', error);
                  alert('Failed to set reminder');
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Set Follow-up Reminder
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 