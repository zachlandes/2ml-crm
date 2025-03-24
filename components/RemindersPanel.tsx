'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Reminder {
  id: string;
  connectionId: string;
  title: string;
  description?: string;
  dueDate: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  connectionName?: string;
}

export default function RemindersPanel() {
  const [todayReminders, setTodayReminders] = useState<Reminder[]>([]);
  const [overdueReminders, setOverdueReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadReminders();
  }, []);
  
  const loadReminders = async () => {
    setLoading(true);
    try {
      const [todayResponse, overdueResponse] = await Promise.all([
        fetch('/api/reminders/today'),
        fetch('/api/reminders/overdue')
      ]);
      
      if (!todayResponse.ok || !overdueResponse.ok) {
        throw new Error('Failed to fetch reminders');
      }
      
      const today = await todayResponse.json();
      const overdue = await overdueResponse.json();
      
      setTodayReminders(today);
      setOverdueReminders(overdue);
    } catch (error) {
      console.error('Failed to load reminders:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCompleteReminder = async (id: string) => {
    try {
      const response = await fetch('/api/reminders/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to complete reminder');
      }
      
      // Update local state
      setTodayReminders(prev => prev.filter(r => r.id !== id));
      setOverdueReminders(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Failed to complete reminder:', error);
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <div className="bg-card bauhaus-card border-primary px-6 py-5 shadow-md">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <div className="h-4 w-4 bg-primary mr-2"></div>
          Reminders
        </h2>
        
        <div className="py-8 flex justify-center">
          <div className="inline-block h-5 w-5 border-2 border-primary/50 border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }
  
  if (todayReminders.length === 0 && overdueReminders.length === 0) {
    return (
      <div className="bg-card bauhaus-card border-primary px-6 py-5 shadow-md">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <div className="h-4 w-4 bg-primary mr-2"></div>
          Reminders
        </h2>
        
        <div className="py-6 text-center">
          <p className="text-muted-foreground text-sm">No reminders for today</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-card bauhaus-card border-primary px-6 py-5 shadow-md">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <div className="h-4 w-4 bg-primary mr-2"></div>
        Reminders
      </h2>
      
      {overdueReminders.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-destructive mb-3 flex items-center">
            <div className="h-3 w-3 bg-destructive mr-2"></div>
            Overdue ({overdueReminders.length})
          </h3>
          <ul className="space-y-3">
            {overdueReminders.map(reminder => (
              <li key={reminder.id} className="flex items-start border-l-2 border-destructive bg-destructive/5 pl-3 py-2">
                <input
                  type="checkbox"
                  className="mr-3 mt-1 rounded-none border-destructive text-destructive focus:ring-destructive"
                  onChange={() => handleCompleteReminder(reminder.id)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <p className="font-medium text-sm truncate">
                      {reminder.title}
                    </p>
                    <span className="text-xs text-destructive whitespace-nowrap ml-2">
                      {formatDate(reminder.dueDate)}
                    </span>
                  </div>
                  <Link 
                    href={`/connection/${reminder.connectionId}`}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    {reminder.connectionName}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {todayReminders.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-primary mb-3 flex items-center">
            <div className="h-3 w-3 bg-primary mr-2"></div>
            Today ({todayReminders.length})
          </h3>
          <ul className="space-y-3">
            {todayReminders.map(reminder => (
              <li key={reminder.id} className="flex items-start border-l-2 border-primary bg-primary/5 pl-3 py-2">
                <input
                  type="checkbox"
                  className="mr-3 mt-1 rounded-none border-primary text-primary focus:ring-primary"
                  onChange={() => handleCompleteReminder(reminder.id)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <p className="font-medium text-sm truncate">
                      {reminder.title}
                    </p>
                  </div>
                  <Link 
                    href={`/connection/${reminder.connectionId}`}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    {reminder.connectionName}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 