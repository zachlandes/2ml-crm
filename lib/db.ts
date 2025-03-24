import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

// Open the database connection
export async function openDb() {
  return open({
    filename: path.join(process.cwd(), 'data', 'crm.db'),
    driver: sqlite3.Database
  });
}

// Initialize the database with necessary tables
export async function initializeDatabase() {
  const db = await openDb();
  
  // Create connections table with additional status fields
  await db.exec(`
    CREATE TABLE IF NOT EXISTS connections (
      id TEXT PRIMARY KEY,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      url TEXT,
      email TEXT,
      company TEXT,
      position TEXT,
      connectedOn TEXT,
      notes TEXT,
      status TEXT DEFAULT 'new',
      lastContactedAt TEXT,
      pastPositions TEXT DEFAULT '[]',
      createdAt TEXT NOT NULL
    );
  `);
  
  // Create messages table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      connectionId TEXT NOT NULL,
      content TEXT NOT NULL,
      sentAt TEXT,
      status TEXT NOT NULL,
      template TEXT NOT NULL,
      metadata TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (connectionId) REFERENCES connections(id)
    );
  `);
  
  // Create referrals table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS referrals (
      id TEXT PRIMARY KEY,
      connectionId TEXT NOT NULL,
      referredConnectionId TEXT,
      referredName TEXT NOT NULL,
      referredPosition TEXT,
      referredCompany TEXT,
      referredEmail TEXT,
      referredLinkedIn TEXT,
      relationshipNotes TEXT,
      status TEXT DEFAULT 'new',
      createdAt TEXT NOT NULL,
      FOREIGN KEY (connectionId) REFERENCES connections(id),
      FOREIGN KEY (referredConnectionId) REFERENCES connections(id)
    );
  `);
  
  // Create notes/activities table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      connectionId TEXT NOT NULL,
      content TEXT NOT NULL,
      type TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (connectionId) REFERENCES connections(id)
    );
  `);
  
  // Create tags table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      createdAt TEXT NOT NULL
    );
  `);
  
  // Create connection_tags many-to-many relationship table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS connection_tags (
      connectionId TEXT NOT NULL,
      tagId TEXT NOT NULL,
      PRIMARY KEY (connectionId, tagId),
      FOREIGN KEY (connectionId) REFERENCES connections(id),
      FOREIGN KEY (tagId) REFERENCES tags(id)
    );
  `);
  
  // Create opportunities table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS opportunities (
      id TEXT PRIMARY KEY,
      connectionId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL,
      value REAL,
      probability INTEGER,
      expectedCloseDate TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (connectionId) REFERENCES connections(id)
    );
  `);
  
  // Create reminders table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      connectionId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      dueDate TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      completedAt TEXT,
      FOREIGN KEY (connectionId) REFERENCES connections(id) ON DELETE CASCADE
    );
  `);
  
  return db;
}

// Execute the database initialization on first import
initializeDatabase().catch(console.error); 