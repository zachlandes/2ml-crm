'use server';

import { Message } from './types';
import { v4 as uuidv4 } from 'uuid';
import { openDb } from './db';
import { updateConnectionStatus } from './connections';
import { trackAction } from './actionTracker';

// Function to save a message to the database
export async function saveMessage(message: Omit<Message, 'id'>): Promise<Message> {
  try {
    const db = await openDb();
    const id = uuidv4();
    const now = new Date().toISOString();
    
    // Insert the message into the database
    await db.run(`
      INSERT INTO messages (id, connectionId, content, status, template, metadata, createdAt) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, id, message.connectionId, message.content, message.status, message.template, 
      message.metadata ? JSON.stringify(message.metadata) : null, now);
    
    console.log(`Message saved with ID: ${id}`);
    
    // Return the created message
    return {
      ...message,
      id
    };
  } catch (error) {
    console.error('Error saving message:', error);
    throw new Error('Failed to save message');
  }
}

// Function to mark a message as sent
export async function markMessageAsSent(id: string): Promise<Message | null> {
  try {
    const db = await openDb();
    const now = new Date().toISOString();
    
    // Update the message status to 'sent'
    await db.run(`
      UPDATE messages
      SET status = 'sent', sentAt = ?
      WHERE id = ?
    `, now, id);
    
    // Get the updated message
    const updatedMessage = await db.get('SELECT * FROM messages WHERE id = ?', id);
    
    if (!updatedMessage) {
      console.error(`Message with ID ${id} not found`);
      return null;
    }
    
    // Parse metadata if it exists
    if (updatedMessage.metadata) {
      updatedMessage.metadata = JSON.parse(updatedMessage.metadata);
    }
    
    // Update the connection status to 'contacted'
    const result = await updateConnectionStatus(updatedMessage.connectionId, 'contacted');
    
    // Track the message sent action
    await trackAction('message_sent');
    
    console.log(`Message ${id} marked as sent`);
    return updatedMessage;
  } catch (error) {
    console.error(`Error marking message ${id} as sent:`, error);
    return null;
  }
}

// Function to get all messages for a connection
export async function getConnectionMessages(connectionId: string): Promise<Message[]> {
  try {
    const db = await openDb();
    
    // Get all messages for the connection
    const messages = await db.all(`
      SELECT * FROM messages
      WHERE connectionId = ?
      ORDER BY createdAt DESC
    `, connectionId);
    
    // Parse metadata for each message
    return messages.map(message => ({
      ...message,
      metadata: message.metadata ? JSON.parse(message.metadata) : undefined
    }));
  } catch (error) {
    console.error(`Error getting messages for connection ${connectionId}:`, error);
    return [];
  }
}

// Function to get a message by ID
export async function getMessage(id: string): Promise<Message | null> {
  try {
    const db = await openDb();
    
    // Get the message
    const message = await db.get('SELECT * FROM messages WHERE id = ?', id);
    
    if (!message) {
      console.log(`Message with ID ${id} not found`);
      return null;
    }
    
    // Parse metadata if it exists
    if (message.metadata) {
      message.metadata = JSON.parse(message.metadata);
    }
    
    return message;
  } catch (error) {
    console.error(`Error getting message ${id}:`, error);
    return null;
  }
}

// Function to generate an ACA message template
export async function generateACATemplate(
  connectionId: string,
  acknowledgment: string,
  compliment: string,
  ask: string
): Promise<Message> {
  const content = `
Hi [First Name],

${acknowledgment}

${compliment}

${ask}

Best,
[Your Name]
  `.trim();
  
  return saveMessage({
    connectionId,
    content,
    status: "draft",
    template: "aca",
    metadata: {
      acknowledgment,
      compliment,
      ask
    }
  });
} 