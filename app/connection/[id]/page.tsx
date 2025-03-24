import { getConnection } from '@/lib/connections';
import { getConnectionMessages } from '@/lib/messages';
import { notFound } from 'next/navigation';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ConnectionNotes from '@/components/ConnectionNotes';
import MessageHistory from '@/components/MessageHistory';
import { 
  getConnectionNotes, 
  updateConnectionStatus, 
  getConnectionTags 
} from '@/lib/connections';
import NotesEditor from './notes-editor';
import StatusSelector from './status-selector';
import ActivityTimeline from './activity-timeline';
import TagManager from './tag-manager';
import { getConnectionReminders } from '@/lib/reminders';
import Reminders from './reminders';

interface ConnectionPageProps {
  params: {
    id: string;
  };
}

export const dynamic = 'force-dynamic';

export default async function ConnectionPage({ params }: ConnectionPageProps) {
  try {
    if (!params.id) {
      notFound();
    }

    const connection = await getConnection(params.id);
    
    if (!connection) {
      console.error(`Connection not found: ${params.id}`);
      notFound();
    }
    
    // Get activity data
    const notes = await getConnectionNotes(connection.id);
    const messages = await getConnectionMessages(connection.id);
    const tags = await getConnectionTags(connection.id);
    const reminders = await getConnectionReminders(connection.id);
    
    // Server-side processing for activities
    const activities = [
      ...notes.map(note => ({
        id: note.id,
        connectionId: note.connectionId,
        content: note.content,
        type: note.type,
        createdAt: note.createdAt
      })),
      // Filter out regular messages if there's a message_sent note for them
      ...messages
        .filter(message => {
          // Only include messages that don't have a corresponding 'message_sent' note
          // A message will be duplicated if:
          // 1. It has status 'sent' AND
          // 2. There's a note of type 'message_sent' that includes part of its content
          if (message.status !== 'sent') {
            return true; // Always include draft messages
          }
          
          const messageContent = message.content.substring(0, 50);
          return !notes.some(note => 
            note.type === 'message_sent' && 
            note.content.includes(messageContent)
          );
        })
        .map(message => ({
          id: message.id,
          connectionId: message.connectionId,
          content: message.content.substring(0, 100) + (message.content.length > 100 ? '...' : ''),
          type: 'message',
          createdAt: message.sentAt || message.createdAt || new Date().toISOString(),
          status: message.status
        })),
      ...reminders.map(reminder => ({
        id: reminder.id,
        connectionId: reminder.connectionId,
        content: `Reminder: ${reminder.title}${reminder.completed ? ' (Completed)' : ''}`,
        type: reminder.completed ? 'reminder_completed' : 'reminder_created',
        createdAt: reminder.createdAt
      }))
    ].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    const formattedDate = connection.connectedOn 
      ? new Date(connection.connectedOn).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : 'Unknown';
    
    return (
      <main className="container mx-auto p-4">
        <div className="mb-6">
          <Link 
            href="/"
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to All Connections
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold mb-2">
                    {connection.firstName} {connection.lastName}
                  </h1>
                  {connection.position && connection.company && (
                    <p className="text-gray-600 mb-1">
                      {connection.position} at {connection.company}
                    </p>
                  )}
                  <p className="text-gray-500 text-sm mb-3">
                    Connected on {formattedDate}
                  </p>
                  
                  {/* Display past positions if they exist */}
                  {connection.pastPositions && connection.pastPositions.length > 0 && (
                    <div className="mt-2">
                      <h3 className="text-sm font-semibold text-gray-600">Past Positions:</h3>
                      <ul className="mt-1 text-sm text-gray-500">
                        {Array.isArray(connection.pastPositions) ? 
                          connection.pastPositions.map((position, index) => (
                            <li key={index} className="mb-1">
                              {position.position && position.company ? 
                                `${position.position} at ${position.company}` : 
                                position.position || position.company
                              }
                              {position.connectedOn && (
                                <span className="text-xs text-gray-400 ml-1">
                                  (connected {new Date(position.connectedOn).toLocaleDateString()})
                                </span>
                              )}
                            </li>
                          )) :
                          <li>Unable to display past positions</li>
                        }
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <StatusSelector 
                    connectionId={connection.id} 
                    currentStatus={connection.status || 'new'} 
                  />
                  
                  <Link
                    href={`/connection/${connection.id}/message`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    Send Message
                  </Link>
                  
                  <a
                    href={connection.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                    View LinkedIn Profile
                  </a>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="border-t pt-4">
                  <h2 className="text-lg font-semibold mb-3">Tags</h2>
                  <TagManager connectionId={connection.id} existingTags={tags} />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Notes</h2>
              <NotesEditor connection={connection} />
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <Reminders connectionId={connection.id} />
            </div>
            
            {activities.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Activity Timeline</h2>
                <ActivityTimeline activities={activities} />
              </div>
            )}
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
              
              <div className="space-y-3">
                {connection.email && (
                  <div>
                    <p className="text-gray-500 text-sm">Email</p>
                    <p>{connection.email}</p>
                  </div>
                )}
                
                {connection.connectedOn && (
                  <div>
                    <p className="text-gray-500 text-sm">Connected Since</p>
                    <p>{formattedDate}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-gray-500 text-sm">LinkedIn URL</p>
                  <a 
                    href={connection.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 break-all"
                  >
                    {connection.url}
                  </a>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Status Tracker</h2>
              
              <div className="space-y-2">
                <div className={`p-3 rounded-md ${connection.status === 'new' ? 'bg-blue-100 border-l-4 border-blue-500' : 'bg-gray-100'}`}>
                  <div className="flex justify-between">
                    <span className={connection.status === 'new' ? 'font-semibold' : ''}>New</span>
                    {connection.status === 'new' && <span>•</span>}
                  </div>
                </div>
                
                <div className={`p-3 rounded-md ${connection.status === 'contacted' ? 'bg-yellow-100 border-l-4 border-yellow-500' : 'bg-gray-100'}`}>
                  <div className="flex justify-between">
                    <span className={connection.status === 'contacted' ? 'font-semibold' : ''}>Contacted</span>
                    {connection.status === 'contacted' && <span>•</span>}
                  </div>
                </div>
                
                <div className={`p-3 rounded-md ${connection.status === 'responded' ? 'bg-indigo-100 border-l-4 border-indigo-500' : 'bg-gray-100'}`}>
                  <div className="flex justify-between">
                    <span className={connection.status === 'responded' ? 'font-semibold' : ''}>Responded</span>
                    {connection.status === 'responded' && <span>•</span>}
                  </div>
                </div>
                
                <div className={`p-3 rounded-md ${connection.status === 'meeting' ? 'bg-purple-100 border-l-4 border-purple-500' : 'bg-gray-100'}`}>
                  <div className="flex justify-between">
                    <span className={connection.status === 'meeting' ? 'font-semibold' : ''}>Meeting Scheduled</span>
                    {connection.status === 'meeting' && <span>•</span>}
                  </div>
                </div>
                
                <div className={`p-3 rounded-md ${connection.status === 'opportunity' ? 'bg-green-100 border-l-4 border-green-500' : 'bg-gray-100'}`}>
                  <div className="flex justify-between">
                    <span className={connection.status === 'opportunity' ? 'font-semibold' : ''}>Opportunity</span>
                    {connection.status === 'opportunity' && <span>•</span>}
                  </div>
                </div>
                
                <div className={`p-3 rounded-md ${connection.status === 'closed' ? 'bg-green-200 border-l-4 border-green-700' : 'bg-gray-100'}`}>
                  <div className="flex justify-between">
                    <span className={connection.status === 'closed' ? 'font-semibold' : ''}>Closed</span>
                    {connection.status === 'closed' && <span>•</span>}
                  </div>
                </div>

                <div className={`p-3 rounded-md ${connection.status === 'will-not-contact' ? 'bg-gray-300 border-l-4 border-gray-600' : 'bg-gray-100'}`}>
                  <div className="flex justify-between">
                    <span className={connection.status === 'will-not-contact' ? 'font-semibold' : ''}>Will Not Contact</span>
                    {connection.status === 'will-not-contact' && <span>•</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error('Error in connection page:', error);
    notFound();
  }
} 