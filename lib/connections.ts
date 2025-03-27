'use server';

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import { Readable } from 'stream';
import { Connection } from './types';
import { createHash } from 'crypto';
import { openDb } from './db';
import { v4 as uuidv4 } from 'uuid';
import { trackAction } from './actionTracker';

// Generate a stable ID based on connection data
function generateStableId(firstName: string, lastName: string): string {
  const str = `${firstName}|${lastName}`;
  return createHash('md5').update(str).digest('hex');
}

// Parse CSV data function
export async function parseCSV(csvString: string): Promise<Connection[]> {
  return new Promise((resolve, reject) => {
    const results: Connection[] = [];
    
    // Skip the first 5 lines which contain info/notes
    const lines = csvString.split('\n');
    const dataLines = lines.slice(5).join('\n');
    
    // Create a readable stream from the CSV string
    const stream = Readable.from(dataLines);
    
    stream
      .pipe(parse({
        from_line: 2, // Skip the header row (line 1)
        columns: ['firstName', 'lastName', 'url', 'email', 'company', 'position', 'connectedOn']
      }))
      .on('data', (data: any) => {
        // Generate a stable ID using just first and last name
        const id = generateStableId(
          data.firstName || '', 
          data.lastName || ''
        );
        
        // Add an id to each record
        results.push({
          ...data,
          id,
          notes: '',
          status: 'new',
          lastContactedAt: null,
          pastPositions: []
        });
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (err: Error) => {
        reject(err);
      });
  });
}

// Function to merge duplicate connections
async function mergeDuplicateConnections(connections: Connection[]): Promise<Connection[]> {
  const uniqueConnections: { [key: string]: Connection } = {};
  
  for (const conn of connections) {
    const nameKey = `${conn.firstName}|${conn.lastName}`.toLowerCase();
    
    if (uniqueConnections[nameKey]) {
      // This is a duplicate - keep the most recent position as primary
      const existing = uniqueConnections[nameKey];
      
      // If this connection is newer (based on connectedOn date), swap primary data
      if (conn.connectedOn && existing.connectedOn && 
          new Date(conn.connectedOn) > new Date(existing.connectedOn)) {
        
        // Store the existing data as a past position
        if (!existing.pastPositions) {
          existing.pastPositions = [];
        }
        
        existing.pastPositions.push({
          company: existing.company,
          position: existing.position,
          url: existing.url,
          connectedOn: existing.connectedOn
        });
        
        // Update primary data with newer information
        existing.company = conn.company;
        existing.position = conn.position;
        existing.url = conn.url;
        existing.connectedOn = conn.connectedOn;
      } else {
        // Add the duplicate's position to the pastPositions array
        if (!existing.pastPositions) {
          existing.pastPositions = [];
        }
        
        existing.pastPositions.push({
          company: conn.company,
          position: conn.position,
          url: conn.url,
          connectedOn: conn.connectedOn
        });
      }
      
      // Merge other important fields if they exist in the duplicate but not in the primary
      if (!existing.email && conn.email) {
        existing.email = conn.email;
      }
      
      // Keep the higher status if applicable
      const statusPriority = {
        'new': 0,
        'contacted': 1,
        'responded': 2,
        'meeting': 3,
        'opportunity': 4,
        'closed': 5
      };
      
      if (conn.status && statusPriority[conn.status as keyof typeof statusPriority] > 
          statusPriority[existing.status as keyof typeof statusPriority]) {
        existing.status = conn.status;
      }
      
      // Keep the most recent lastContactedAt
      if (conn.lastContactedAt && (!existing.lastContactedAt || 
          new Date(conn.lastContactedAt) > new Date(existing.lastContactedAt))) {
        existing.lastContactedAt = conn.lastContactedAt;
      }
      
    } else {
      // First occurrence - initialize pastPositions array if not present
      if (!conn.pastPositions) {
        conn.pastPositions = [];
      }
      uniqueConnections[nameKey] = conn;
    }
  }
  
  return Object.values(uniqueConnections);
}

// Function to load connections from CSV file and insert into database if needed
export async function loadConnections(): Promise<Connection[]> {
  try {
    const db = await openDb();
    
    // Check if we have any connections in the database
    const connectionCount = await db.get('SELECT COUNT(*) as count FROM connections');
    
    // If we already have connections, just return them
    if (connectionCount && connectionCount.count > 0) {
      console.log(`Fetching ${connectionCount.count} connections from database`);
      const connections = await db.all('SELECT * FROM connections ORDER BY firstName');
      
      // Parse pastPositions JSON for each connection
      for (const connection of connections) {
        if (connection.pastPositions) {
          try {
            connection.pastPositions = JSON.parse(connection.pastPositions);
          } catch (error) {
            console.error(`Error parsing pastPositions for connection ${connection.id}:`, error);
            connection.pastPositions = [];
          }
        } else {
          connection.pastPositions = [];
        }
      }
      
      // Merge duplicates before returning
      return mergeDuplicateConnections(connections);
    }
    
    // If no connections in DB, import from CSV
    console.log('No connections in database, importing from CSV file');
    
    // Read the CSV file
    const csvFilePath = path.join(process.cwd(), 'Data', 'Connections.csv');
    console.log(`Loading connections from ${csvFilePath}`);
    
    if (!fs.existsSync(csvFilePath)) {
      console.error(`CSV file not found at ${csvFilePath}`);
      return [];
    }
    
    const csvData = fs.readFileSync(csvFilePath, 'utf-8');
    console.log(`CSV data loaded, size: ${csvData.length} bytes`);
    
    // Parse the CSV data
    let connections = await parseCSV(csvData);
    console.log(`Parsed ${connections.length} connections`);
    
    // Merge duplicates
    connections = await mergeDuplicateConnections(connections);
    console.log(`After merging duplicates: ${connections.length} unique connections`);
    
    // Insert parsed connections into database
    const now = new Date().toISOString();
    const insertStmt = await db.prepare(`
      INSERT OR REPLACE INTO connections 
      (id, firstName, lastName, url, email, company, position, connectedOn, notes, status, lastContactedAt, pastPositions, createdAt) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (const conn of connections) {
      await insertStmt.run(
        conn.id,
        conn.firstName,
        conn.lastName,
        conn.url,
        conn.email || null,
        conn.company || null,
        conn.position || null,
        conn.connectedOn || null,
        conn.notes || '',
        conn.status || 'new',
        conn.lastContactedAt || null,
        conn.pastPositions ? JSON.stringify(conn.pastPositions) : '[]',
        now
      );
    }
    
    await insertStmt.finalize();
    console.log(`Inserted connections into database`);
    
    // Return the freshly inserted connections
    return connections;
  } catch (error) {
    console.error('Error loading connections:', error);
    return [];
  }
}

// Function to get a single connection by ID
export async function getConnection(id: string): Promise<Connection | null> {
  try {
    const db = await openDb();
    const connection = await db.get('SELECT * FROM connections WHERE id = ?', id);
    
    if (!connection) {
      console.log(`Connection with ID ${id} not found`);
      return null;
    }
    
    // Parse pastPositions JSON if it exists
    if (connection.pastPositions) {
      try {
        connection.pastPositions = JSON.parse(connection.pastPositions);
      } catch (error) {
        console.error(`Error parsing pastPositions for connection ${id}:`, error);
        connection.pastPositions = [];
      }
    } else {
      connection.pastPositions = [];
    }
    
    return connection;
  } catch (error) {
    console.error(`Error getting connection ${id}:`, error);
    return null;
  }
}

// Function to update a connection's notes
export async function updateConnectionNotes(id: string, notes: string): Promise<Connection | null> {
  try {
    const db = await openDb();
    const now = new Date().toISOString();
    
    // First, update the notes field in the connections table
    await db.run('UPDATE connections SET notes = ? WHERE id = ?', notes, id);
    
    // Also create a note entry for the timeline - include the actual note content
    const noteId = uuidv4();
    await db.run(
      'INSERT INTO notes (id, connectionId, content, type, createdAt) VALUES (?, ?, ?, ?, ?)',
      noteId, id, notes, 'note_updated', now
    );
    
    // Track the note addition
    await trackAction('note_added');
    
    // Get the updated connection
    return getConnection(id);
  } catch (error) {
    console.error(`Error updating notes for connection ${id}:`, error);
    return null;
  }
}

// Function to update connection status
export async function updateConnectionStatus(id: string, status: string): Promise<{ connection: Connection | null, clearedReminders: number }> {
  try {
    const db = await openDb();
    const now = new Date().toISOString();
    
    await db.run(
      'UPDATE connections SET status = ?, lastContactedAt = ? WHERE id = ?', 
      status, now, id
    );
    
    // Track the status update
    await trackAction('status_updated');
    
    // Clear any reminders for this connection
    const { clearRemindersOnStatusChange } = await import('./reminders');
    const { clearedCount } = await clearRemindersOnStatusChange(id);
    
    // Get the updated connection
    const connection = await getConnection(id);
    
    return { 
      connection, 
      clearedReminders: clearedCount 
    };
  } catch (error) {
    console.error(`Error updating status for connection ${id}:`, error);
    return { 
      connection: null, 
      clearedReminders: 0 
    };
  }
}

// Function to create a new activity note for a connection
export async function addConnectionNote(
  connectionId: string, 
  content: string, 
  type: string
): Promise<{ id: string } | null> {
  try {
    const db = await openDb();
    const now = new Date().toISOString();
    const id = uuidv4();
    
    await db.run(
      'INSERT INTO notes (id, connectionId, content, type, createdAt) VALUES (?, ?, ?, ?, ?)',
      id, connectionId, content, type, now
    );
    
    // Update the last contacted timestamp for the connection
    await db.run(
      'UPDATE connections SET lastContactedAt = ? WHERE id = ?',
      now, connectionId
    );
    
    // Track the note addition
    await trackAction('note_added');
    
    return { id };
  } catch (error) {
    console.error(`Error adding note for connection ${connectionId}:`, error);
    return null;
  }
}

// Function to get all notes for a connection
export async function getConnectionNotes(connectionId: string): Promise<any[]> {
  try {
    const db = await openDb();
    
    const notes = await db.all(
      'SELECT * FROM notes WHERE connectionId = ? ORDER BY createdAt DESC',
      connectionId
    );
    
    return notes;
  } catch (error) {
    console.error(`Error getting notes for connection ${connectionId}:`, error);
    return [];
  }
}

// Function to add a tag
export async function createTag(name: string): Promise<{ id: string, name: string } | null> {
  try {
    const db = await openDb();
    const now = new Date().toISOString();
    const id = uuidv4();
    
    await db.run('INSERT OR IGNORE INTO tags (id, name, createdAt) VALUES (?, ?, ?)', id, name, now);
    
    return { id, name };
  } catch (error) {
    console.error(`Error creating tag '${name}':`, error);
    return null;
  }
}

// Function to add a tag to a connection
export async function addTagToConnection(connectionId: string, tagId: string): Promise<boolean> {
  try {
    const db = await openDb();
    
    await db.run(
      'INSERT OR IGNORE INTO connection_tags (connectionId, tagId) VALUES (?, ?)',
      connectionId, tagId
    );
    
    // Track the connection tagging
    await trackAction('connection_tagged');
    
    return true;
  } catch (error) {
    console.error(`Error adding tag ${tagId} to connection ${connectionId}:`, error);
    return false;
  }
}

// Function to get all tags
export async function getAllTags(): Promise<any[]> {
  try {
    const db = await openDb();
    
    const tags = await db.all('SELECT * FROM tags ORDER BY name');
    
    return tags;
  } catch (error) {
    console.error('Error getting tags:', error);
    return [];
  }
}

// Function to get tags for a connection
export async function getConnectionTags(connectionId: string): Promise<any[]> {
  try {
    const db = await openDb();
    
    const tags = await db.all(`
      SELECT t.* FROM tags t
      JOIN connection_tags ct ON t.id = ct.tagId
      WHERE ct.connectionId = ?
      ORDER BY t.name
    `, connectionId);
    
    return tags;
  } catch (error) {
    console.error(`Error getting tags for connection ${connectionId}:`, error);
    return [];
  }
}

// Function to remove a tag from a connection
export async function removeTagFromConnection(connectionId: string, tagId: string): Promise<boolean> {
  try {
    const db = await openDb();
    
    await db.run(
      'DELETE FROM connection_tags WHERE connectionId = ? AND tagId = ?',
      connectionId, tagId
    );
    
    return true;
  } catch (error) {
    console.error(`Error removing tag ${tagId} from connection ${connectionId}:`, error);
    return false;
  }
}

// Function to delete a note by ID
export async function deleteNote(id: string): Promise<boolean> {
  try {
    const db = await openDb();
    
    // Delete the note
    await db.run('DELETE FROM notes WHERE id = ?', id);
    
    return true;
  } catch (error) {
    console.error(`Error deleting note ${id}:`, error);
    return false;
  }
} 