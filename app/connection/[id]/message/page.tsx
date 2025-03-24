import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getConnection } from '@/lib/connections';
import ComposeMessage from './compose-message';

export const dynamic = 'force-dynamic';

export default async function MessagePage({ params }: { params: { id: string } }) {
  const connection = await getConnection(params.id);
  
  if (!connection) {
    console.error(`Connection not found: ${params.id}`);
    notFound();
  }
  
  return (
    <main className="container mx-auto p-4">
      <div className="mb-6">
        <Link 
          href={`/connection/${connection.id}`}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Connection Details
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            Message {connection.firstName} {connection.lastName}
          </h1>
          
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
        
        <ComposeMessage connection={connection} />
      </div>
    </main>
  );
} 