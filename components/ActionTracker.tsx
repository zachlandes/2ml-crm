'use client';

import { useState, useEffect } from 'react';
import { ActionType } from '@/lib/actionTracker';
import { usePathname } from 'next/navigation';

// Define the action details for each type
const actionTypeDetails: Record<ActionType, { label: string, icon: string, color: string }> = {
  message_sent: { 
    label: 'Messages Sent', 
    icon: '📨', 
    color: 'bg-primary'
  },
  reminder_created: { 
    label: 'Reminders Set', 
    icon: '📅', 
    color: 'bg-accent'
  },
  reminder_completed: { 
    label: 'Reminders Completed', 
    icon: '✅', 
    color: 'bg-green-500'
  },
  status_updated: { 
    label: 'Status Updates', 
    icon: '📊', 
    color: 'bg-secondary'
  },
  connection_tagged: { 
    label: 'Tags Added', 
    icon: '🏷️', 
    color: 'bg-accent'
  },
  note_added: { 
    label: 'Notes Added', 
    icon: '📝', 
    color: 'bg-blue-400'
  }
};

type Action = {
  id: string;
  userId: string;
  actionType: ActionType;
  count: number;
  lastUpdatedAt: string;
  createdAt: string;
};

// Helper functions for data fetching
const fetchTotalCount = async (): Promise<number> => {
  try {
    const response = await fetch('/api/actions/count');
    const data = await response.json();
    return data.total;
  } catch (error) {
    console.error('Error fetching action count:', error);
    return 0;
  }
};

const fetchActions = async (): Promise<Action[]> => {
  try {
    const response = await fetch('/api/actions');
    const data = await response.json();
    return data.actions;
  } catch (error) {
    console.error('Error fetching actions:', error);
    return [];
  }
};

// Component to display the total action count in the header
export function ActionCounter() {
  const [count, setCount] = useState<number>(0);
  const [actions, setActions] = useState<Action[]>([]);
  const [showPanel, setShowPanel] = useState<boolean>(false);
  const [newAction, setNewAction] = useState<boolean>(false);
  const pathname = usePathname();

  // Fetch the action counts on mount and when pathname changes
  useEffect(() => {
    const loadCount = async () => {
      const total = await fetchTotalCount();
      setCount(total);
    };
    
    loadCount();
  }, [pathname]);
  
  // Fetch all actions when the panel is opened
  useEffect(() => {
    if (showPanel) {
      const loadActions = async () => {
        const actionsList = await fetchActions();
        setActions(actionsList);
      };
      
      loadActions();
    }
  }, [showPanel]);
  
  // Check for updates to the action count every 3 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const total = await fetchTotalCount();
      
      // Check if count has increased
      if (total > count) {
        setNewAction(true);
        // Animate the counter briefly
        setTimeout(() => setNewAction(false), 2000);
      }
      
      setCount(total);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [count]);
  
  return (
    <div className="relative">
      <button 
        onClick={() => setShowPanel(!showPanel)}
        className={`
          flex items-center gap-1 px-3 py-1.5 rounded-md transition-all
          ${showPanel ? 'bg-primary/20' : 'hover:bg-muted'}
          ${newAction ? 'scale-110' : 'scale-100'}
        `}
      >
        <span className="flex h-6 w-6 items-center justify-center bg-primary text-primary-foreground rounded-full text-xs font-bold">
          {count}
        </span>
        <span className="text-sm font-medium">Actions</span>
      </button>
      
      {showPanel && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-background border rounded-md shadow-lg z-50 overflow-hidden">
          <div className="p-3 border-b bg-muted">
            <h3 className="font-semibold">Your Progress</h3>
          </div>
          <div className="px-3 py-2 max-h-96 overflow-y-auto">
            {actions.length === 0 ? (
              <p className="text-center text-muted-foreground py-4 text-sm">
                No actions recorded yet
              </p>
            ) : (
              <ul className="space-y-2">
                {actions.map(action => {
                  const details = actionTypeDetails[action.actionType];
                  return (
                    <li key={action.id} className="flex items-center justify-between text-sm py-1">
                      <div className="flex items-center gap-2">
                        <span className={`flex h-6 w-6 items-center justify-center text-xs ${details.color} text-white rounded-full`}>
                          {details.icon}
                        </span>
                        <span>{details.label}</span>
                      </div>
                      <span className="font-semibold">{action.count}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <div className="p-3 border-t bg-muted text-center">
            <p className="text-sm font-medium">
              Total Actions: <span className="font-bold">{count}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 