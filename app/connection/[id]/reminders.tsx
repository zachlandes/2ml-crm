'use client';

import { useState, useEffect } from 'react';

interface Reminder {
  id: string;
  connectionId: string;
  title: string;
  description?: string;
  dueDate: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

interface RemindersProps {
  connectionId: string;
}

export default function Reminders({ connectionId }: RemindersProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Initialize by loading reminders
  useEffect(() => {
    loadReminders();
  }, [connectionId]);
  
  // Load reminders
  const loadReminders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reminders/connection/${connectionId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reminders');
      }
      
      const data = await response.json();
      setReminders(data);
    } catch (error) {
      console.error('Failed to load reminders:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form submission for new reminder
  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !dueDate) return;
    
    try {
      const response = await fetch('/api/reminders/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connectionId,
          title,
          dueDate,
          description: description || undefined
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create reminder');
      }
      
      const newReminder = await response.json();
      setReminders(prev => [...prev, newReminder]);
      resetForm();
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to create reminder:', error);
    }
  };
  
  // Handle form submission for editing reminder
  const handleEditReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingReminder || !title || !dueDate) return;
    
    try {
      const response = await fetch('/api/reminders/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingReminder.id,
          updates: {
            title,
            description: description || null,
            dueDate
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update reminder');
      }
      
      // Update local state
      setReminders(prev => 
        prev.map(reminder => 
          reminder.id === editingReminder.id 
            ? { 
                ...reminder, 
                title, 
                description, 
                dueDate 
              } 
            : reminder
        )
      );
      
      resetForm();
      setShowEditForm(false);
      setEditingReminder(null);
    } catch (error) {
      console.error('Failed to update reminder:', error);
    }
  };
  
  // Handle toggling reminder completion
  const handleToggleComplete = async (reminder: Reminder) => {
    try {
      const response = await fetch('/api/reminders/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: reminder.id }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update reminder completion status');
      }
      
      // Update local state
      setReminders(prev => 
        prev.map(r => 
          r.id === reminder.id 
            ? { ...r, completed: !r.completed } 
            : r
        )
      );
    } catch (error) {
      console.error('Failed to toggle reminder completion:', error);
    }
  };
  
  // Handle deleting a reminder
  const handleDeleteReminder = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reminder?')) {
      return;
    }
    
    try {
      const response = await fetch('/api/reminders/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete reminder');
      }
      
      setReminders(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Failed to delete reminder:', error);
    }
  };
  
  // Start editing a reminder
  const startEditReminder = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setTitle(reminder.title);
    setDescription(reminder.description || '');
    setDueDate(reminder.dueDate.split('T')[0]);
    setShowEditForm(true);
  };
  
  // Reset form state
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate(new Date().toISOString().split('T')[0]);
    setEditingReminder(null);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Calculate if a reminder is overdue
  const isOverdue = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reminderDate = new Date(dueDate);
    reminderDate.setHours(0, 0, 0, 0);
    return reminderDate < today && !reminderDate.toISOString().includes(today.toISOString().split('T')[0]);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Follow-up Reminders</h3>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
          >
            Add Reminder
          </button>
        )}
      </div>
      
      {showAddForm && (
        <div className="bg-gray-50 p-4 border rounded-md">
          <h4 className="font-medium mb-3">Add New Reminder</h4>
          <form onSubmit={handleAddReminder} className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Title
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded-md"
                rows={2}
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Due Date
                <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
                className="px-3 py-1 border rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Reminder
              </button>
            </div>
          </form>
        </div>
      )}
      
      {showEditForm && editingReminder && (
        <div className="bg-gray-50 p-4 border rounded-md">
          <h4 className="font-medium mb-3">Edit Reminder</h4>
          <form onSubmit={handleEditReminder} className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Title
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded-md"
                rows={2}
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Due Date
                <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowEditForm(false);
                  resetForm();
                }}
                className="px-3 py-1 border rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update Reminder
              </button>
            </div>
          </form>
        </div>
      )}
      
      {loading ? (
        <p className="text-gray-500 text-sm">Loading reminders...</p>
      ) : reminders.length === 0 ? (
        <p className="text-gray-500 text-sm">No reminders set for this connection.</p>
      ) : (
        <ul className="space-y-2">
          {reminders.map(reminder => (
            <li 
              key={reminder.id} 
              className={`border rounded-md p-3 ${
                reminder.completed 
                  ? 'bg-gray-50' 
                  : isOverdue(reminder.dueDate)
                    ? 'bg-red-50 border-red-200'
                    : 'bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={reminder.completed}
                    onChange={() => handleToggleComplete(reminder)}
                    className="mt-1"
                  />
                  <div>
                    <h4 className={`font-medium ${reminder.completed ? 'line-through text-gray-500' : ''}`}>
                      {reminder.title}
                    </h4>
                    
                    {reminder.description && (
                      <p className={`text-sm mt-1 ${reminder.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                        {reminder.description}
                      </p>
                    )}
                    
                    <div className="flex items-center mt-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span 
                        className={`text-xs ${
                          reminder.completed 
                            ? 'text-gray-400' 
                            : isOverdue(reminder.dueDate)
                              ? 'text-red-600 font-medium'
                              : 'text-gray-500'
                        }`}
                      >
                        {isOverdue(reminder.dueDate) && !reminder.completed ? 'Overdue: ' : 'Due: '}
                        {formatDate(reminder.dueDate)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-1">
                  <button
                    onClick={() => startEditReminder(reminder)}
                    className="text-gray-500 hover:text-blue-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteReminder(reminder.id)}
                    className="text-gray-500 hover:text-red-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 