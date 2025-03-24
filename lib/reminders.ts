import { openDb } from './db';
import { v4 as uuidv4 } from 'uuid';

export interface Reminder {
  id: string;
  connectionId: string;
  title: string;
  description?: string;
  dueDate: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  // Additional fields for UI display
  connectionName?: string;
}

// Create a new reminder
export async function createReminder(
  connectionId: string,
  title: string,
  dueDate: string,
  description?: string
): Promise<Reminder> {
  const db = await openDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  
  await db.run(`
    INSERT INTO reminders (id, connectionId, title, description, dueDate, createdAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `, id, connectionId, title, description || null, dueDate, now);
  
  return {
    id,
    connectionId,
    title,
    description,
    dueDate,
    completed: false,
    createdAt: now
  };
}

// Get all reminders for a connection
export async function getConnectionReminders(connectionId: string): Promise<Reminder[]> {
  const db = await openDb();
  
  const rows = await db.all(`
    SELECT * FROM reminders
    WHERE connectionId = ?
    ORDER BY 
      completed ASC,
      dueDate ASC
  `, connectionId);
  
  return rows.map((row: any) => ({
    ...row,
    completed: Boolean(row.completed)
  }));
}

// Get a single reminder by ID
export async function getReminder(id: string): Promise<Reminder | null> {
  const db = await openDb();
  
  const row = await db.get(`
    SELECT * FROM reminders
    WHERE id = ?
  `, id);
  
  if (!row) {
    return null;
  }
  
  return {
    ...row,
    completed: Boolean(row.completed)
  };
}

// Mark a reminder as completed
export async function completeReminder(id: string): Promise<void> {
  const db = await openDb();
  const now = new Date().toISOString();
  
  await db.run(`
    UPDATE reminders
    SET completed = 1, completedAt = ?
    WHERE id = ?
  `, now, id);
}

// Mark a reminder as incomplete
export async function uncompleteReminder(id: string): Promise<void> {
  const db = await openDb();
  
  await db.run(`
    UPDATE reminders
    SET completed = 0, completedAt = NULL
    WHERE id = ?
  `, id);
}

// Update a reminder
export async function updateReminder(
  id: string,
  updates: {
    title?: string;
    description?: string | null;
    dueDate?: string;
  }
): Promise<void> {
  const db = await openDb();
  
  // Build the SET clause dynamically based on what needs updating
  const sets: string[] = [];
  const params: any[] = [];
  
  if (updates.title !== undefined) {
    sets.push('title = ?');
    params.push(updates.title);
  }
  
  if (updates.description !== undefined) {
    sets.push('description = ?');
    params.push(updates.description);
  }
  
  if (updates.dueDate !== undefined) {
    sets.push('dueDate = ?');
    params.push(updates.dueDate);
  }
  
  if (sets.length === 0) {
    return; // Nothing to update
  }
  
  const query = `
    UPDATE reminders
    SET ${sets.join(', ')}
    WHERE id = ?
  `;
  
  params.push(id);
  await db.run(query, ...params);
}

// Delete a reminder
export async function deleteReminder(id: string): Promise<void> {
  const db = await openDb();
  
  await db.run(`
    DELETE FROM reminders
    WHERE id = ?
  `, id);
}

// Get all upcoming reminders across all connections
export async function getUpcomingReminders(limit: number = 10): Promise<Reminder[]> {
  const db = await openDb();
  
  const rows = await db.all(`
    SELECT r.*, c.firstName || ' ' || c.lastName as connectionName
    FROM reminders r
    JOIN connections c ON r.connectionId = c.id
    WHERE r.completed = 0
    ORDER BY r.dueDate ASC
    LIMIT ?
  `, limit);
  
  return rows.map((row: any) => ({
    ...row,
    completed: Boolean(row.completed)
  }));
}

// Get all reminders due today
export async function getTodaysReminders(): Promise<Reminder[]> {
  const db = await openDb();
  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
  
  const rows = await db.all(`
    SELECT r.*, c.firstName || ' ' || c.lastName as connectionName
    FROM reminders r
    JOIN connections c ON r.connectionId = c.id
    WHERE r.completed = 0 
    AND date(r.dueDate) = date(?)
    ORDER BY r.dueDate ASC
  `, today);
  
  return rows.map((row: any) => ({
    ...row,
    completed: Boolean(row.completed)
  }));
}

// Get overdue reminders
export async function getOverdueReminders(): Promise<Reminder[]> {
  const db = await openDb();
  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
  
  const rows = await db.all(`
    SELECT r.*, c.firstName || ' ' || c.lastName as connectionName
    FROM reminders r
    JOIN connections c ON r.connectionId = c.id
    WHERE r.completed = 0 
    AND date(r.dueDate) < date(?)
    ORDER BY r.dueDate ASC
  `, today);
  
  return rows.map((row: any) => ({
    ...row,
    completed: Boolean(row.completed)
  }));
} 