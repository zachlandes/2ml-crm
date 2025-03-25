'use server';

import { openDb } from './db';
import { v4 as uuidv4 } from 'uuid';

/**
 * Action types that can be tracked
 */
export type ActionType = 
  | 'message_sent'
  | 'reminder_created'
  | 'reminder_completed'
  | 'status_updated'
  | 'connection_tagged'
  | 'note_added';

export interface ActionTracker {
  id: string;
  userId: string;
  actionType: ActionType;
  count: number;
  lastUpdatedAt: string;
  createdAt: string;
}

/**
 * Record a new action or increment an existing action count
 */
export async function trackAction(actionType: ActionType): Promise<void> {
  try {
    const db = await openDb();
    const now = new Date().toISOString();
    
    // Check if this action type already exists
    const existingAction = await db.get(
      'SELECT * FROM action_tracker WHERE actionType = ? AND userId = ?', 
      actionType, 'current_user'
    );
    
    if (existingAction) {
      // Increment the existing action count
      await db.run(
        'UPDATE action_tracker SET count = count + 1, lastUpdatedAt = ? WHERE id = ?',
        now, existingAction.id
      );
    } else {
      // Create a new action tracker record
      const id = uuidv4();
      await db.run(
        'INSERT INTO action_tracker (id, userId, actionType, count, lastUpdatedAt, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
        id, 'current_user', actionType, 1, now, now
      );
    }
  } catch (error) {
    console.error('Error tracking action:', error);
  }
}

/**
 * Get all action counts for the current user
 */
export async function getActionCounts(): Promise<ActionTracker[]> {
  try {
    const db = await openDb();
    const actions = await db.all(
      'SELECT * FROM action_tracker WHERE userId = ? ORDER BY count DESC',
      'current_user'
    );
    return actions;
  } catch (error) {
    console.error('Error getting action counts:', error);
    return [];
  }
}

/**
 * Get the total of all tracked actions
 */
export async function getTotalActionCount(): Promise<number> {
  try {
    const db = await openDb();
    const result = await db.get(
      'SELECT SUM(count) as total FROM action_tracker WHERE userId = ?',
      'current_user'
    );
    return result?.total || 0;
  } catch (error) {
    console.error('Error getting total action count:', error);
    return 0;
  }
}

/**
 * Get action count for a specific action type
 */
export async function getActionCountByType(actionType: ActionType): Promise<number> {
  try {
    const db = await openDb();
    const result = await db.get(
      'SELECT count FROM action_tracker WHERE actionType = ? AND userId = ?',
      actionType, 'current_user'
    );
    return result?.count || 0;
  } catch (error) {
    console.error(`Error getting action count for ${actionType}:`, error);
    return 0;
  }
} 