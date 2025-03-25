'use client';

import { useState, useEffect } from 'react';
import { ActionType } from '@/lib/actionTracker';

type NotificationProps = {
  actionType: ActionType;
  message: string;
  onComplete: () => void;
};

// Map of emoji icons for each action type
const actionTypeIcons: Record<ActionType, string> = {
  message_sent: '📨',
  reminder_created: '📅',
  reminder_completed: '✅',
  status_updated: '📊',
  connection_tagged: '🏷️',
  note_added: '📝'
};

export function ActionNotification({ actionType, message, onComplete }: NotificationProps) {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    // Show the notification for 3 seconds before fading out
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 300); // Remove from DOM after transition completes
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onComplete]);
  
  return (
    <div 
      className={`
        fixed bottom-4 right-4 bg-background border border-primary rounded-lg shadow-lg p-4
        transition-opacity duration-300 z-50 flex items-center gap-3
        ${visible ? 'opacity-100' : 'opacity-0'}
      `}
    >
      <div className="h-10 w-10 flex items-center justify-center bg-primary text-primary-foreground rounded-full">
        <span className="text-lg">{actionTypeIcons[actionType]}</span>
      </div>
      <div>
        <p className="font-medium text-sm">Action Completed</p>
        <p className="text-foreground/80 text-xs">{message}</p>
      </div>
    </div>
  );
}

// Context and provider for managing notifications globally
import { createContext, useContext, ReactNode } from 'react';

type NotificationItem = {
  id: string;
  actionType: ActionType;
  message: string;
};

type NotificationContextType = {
  notifications: NotificationItem[];
  addNotification: (actionType: ActionType, message: string) => void;
  removeNotification: (id: string) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  
  const addNotification = (actionType: ActionType, message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, actionType, message }]);
  };
  
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
      {notifications.map(notification => (
        <ActionNotification
          key={notification.id}
          actionType={notification.actionType}
          message={notification.message}
          onComplete={() => removeNotification(notification.id)}
        />
      ))}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
} 