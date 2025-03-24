import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Get URL parameters
    const url = new URL(request.url);
    const tagIds = url.searchParams.get('tagIds')?.split(',') || [];
    const filterMode = url.searchParams.get('mode') || 'OR'; // OR (inclusive) or AND (exclusive)
    
    if (tagIds.length === 0) {
      return NextResponse.json({ error: 'No tag IDs provided' }, { status: 400 });
    }
    
    const db = await openDb();
    let connections = [];
    
    if (filterMode === 'OR') {
      // OR logic - connections with any of the specified tags
      connections = await db.all(`
        SELECT DISTINCT c.* 
        FROM connections c
        JOIN connection_tags ct ON c.id = ct.connectionId
        WHERE ct.tagId IN (${tagIds.map(() => '?').join(',')})
        ORDER BY c.firstName, c.lastName
      `, ...tagIds);
    } else {
      // AND logic - connections with all of the specified tags
      // This uses a query that counts how many of the requested tags each connection has
      // and only returns those where the count equals the number of requested tags
      connections = await db.all(`
        SELECT c.* 
        FROM connections c
        JOIN connection_tags ct ON c.id = ct.connectionId
        WHERE ct.tagId IN (${tagIds.map(() => '?').join(',')})
        GROUP BY c.id
        HAVING COUNT(DISTINCT ct.tagId) = ?
        ORDER BY c.firstName, c.lastName
      `, ...tagIds, tagIds.length);
    }
    
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
    
    return NextResponse.json({ connections });
  } catch (error) {
    console.error('Error filtering connections by tags:', error);
    return NextResponse.json({ error: 'Failed to filter connections' }, { status: 500 });
  }
} 