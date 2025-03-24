import { loadConnections, getAllTags } from '@/lib/connections';
import ConnectionsList from '@/components/ConnectionsList';
import RemindersPanel from '@/components/RemindersPanel';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const initialConnections = await loadConnections();
  const allTags = await getAllTags();
  
  return (
    <main className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">My Connections</h1>
            <p className="text-gray-600">
              Manage and track your LinkedIn connections, messages, and follow-ups.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Total Connections: {initialConnections.length}
            </p>
          </div>
          
          <ConnectionsList initialConnections={initialConnections} allTags={allTags} />
        </div>
        
        <div>
          <RemindersPanel />
          
          <div className="bg-white rounded-lg shadow-md p-4 mt-6">
            <h2 className="text-lg font-semibold mb-3">Quick Tips</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Use the <strong>status selector</strong> to track your engagement with each connection.</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Set <strong>reminders</strong> for follow-ups to stay on top of important connections.</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Use <strong>tags</strong> to categorize connections and filter your list efficiently.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
} 