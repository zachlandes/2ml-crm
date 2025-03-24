import { loadConnections, getAllTags } from '@/lib/connections';
import ConnectionsList from '@/components/ConnectionsList';
import RemindersPanel from '@/components/RemindersPanel';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const initialConnections = await loadConnections();
  const allTags = await getAllTags();
  
  return (
    <section className="relative">
      {/* Bauhaus decorative elements */}
      <div className="bauhaus-line w-32 -rotate-45 top-10 left-0"></div>
      <div className="bauhaus-circle w-24 h-24 bg-secondary/10 top-40 right-10"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <header className="mb-8 relative">
            <div className="absolute -top-2 -left-3 h-12 w-3 bg-primary"></div>
            <h1 className="text-3xl font-bold mb-3 pl-2">My Connections</h1>
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                Manage and track your LinkedIn connections, messages, and follow-ups.
              </p>
              <span className="inline-flex items-center px-3 py-1 bg-muted text-muted-foreground text-sm">
                {initialConnections.length} Connections
              </span>
            </div>
          </header>
          
          <ConnectionsList initialConnections={initialConnections} allTags={allTags} />
        </div>
        
        <div>
          <div className="sticky top-24">
            <RemindersPanel />
            
            <div className="bg-card bauhaus-card border-accent px-6 py-5 mt-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <div className="h-4 w-4 bg-accent mr-2"></div>
                Quick Tips
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start relative pl-6">
                  <div className="absolute left-0 top-1.5 h-2 w-2 bg-primary"></div>
                  <span>Use the <strong className="text-primary">status selector</strong> to track your engagement with each connection.</span>
                </li>
                <li className="flex items-start relative pl-6">
                  <div className="absolute left-0 top-1.5 h-2 w-2 bg-secondary"></div>
                  <span>Set <strong className="text-secondary">reminders</strong> for follow-ups to stay on top of important connections.</span>
                </li>
                <li className="flex items-start relative pl-6">
                  <div className="absolute left-0 top-1.5 h-2 w-2 bg-accent"></div>
                  <span>Use <strong className="text-accent">tags</strong> to categorize connections and filter your list efficiently.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 