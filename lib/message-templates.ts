'use server';

import { saveMessage } from './messages';
import { Message } from './types';

// Function to create an ACA (Acknowledge, Compliment, Ask) message
export async function createAcaMessage(
  connectionId: string,
  acknowledgment: string,
  compliment: string,
  ask: string
): Promise<Message> {
  // Format the message using the ACA template
  const content = `
${acknowledgment}

${compliment}

${ask}

Best
Zach
  `.trim();
  
  return saveMessage({
    connectionId,
    content,
    status: 'draft',
    template: 'aca',
    metadata: {
      acknowledgment,
      compliment,
      ask
    }
  });
}

// Function to create a custom message
export async function composeCustomMessage(
  connectionId: string,
  content: string
): Promise<Message> {
  return saveMessage({
    connectionId,
    content,
    status: 'draft',
    template: 'custom'
  });
} 