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
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold mb-2">Reminders</h2>
        <p className="text-gray-500 text-sm">Loading reminders...</p>
      </div>
    );
  }
  
  if (todayReminders.length === 0 && overdueReminders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold mb-2">Reminders</h2>
        <p className="text-gray-500 text-sm">No upcoming reminders.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-3">Reminders</h2>
      
      {overdueReminders.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-red-600 mb-2">
            Overdue ({overdueReminders.length})
          </h3>
          <ul className="space-y-2">
            {overdueReminders.map(reminder => (
              <li key={reminder.id} className="flex items-start border-l-2 border-red-400 pl-2 py-1">
                <input
                  type="checkbox"
                  className="mr-2 mt-1"
                  onChange={() => handleCompleteReminder(reminder.id)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <p className="font-medium text-sm truncate">
                      {reminder.title}
                    </p>
                    <span className="text-xs text-red-600 whitespace-nowrap ml-2">
                      {formatDate(reminder.dueDate)}
                    </span>
                  </div>
                  <Link 
                    href={`/connection/${reminder.connectionId}`}
                    className="text-xs text-blue-600 hover:text-blue-800"
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
          <h3 className="text-sm font-medium text-blue-600 mb-2">
            Today ({todayReminders.length})
          </h3>
          <ul className="space-y-2">
            {todayReminders.map(reminder => (
              <li key={reminder.id} className="flex items-start border-l-2 border-blue-400 pl-2 py-1">
                <input
                  type="checkbox"
                  className="mr-2 mt-1"
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
                    className="text-xs text-blue-600 hover:text-blue-800"
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