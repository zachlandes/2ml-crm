'use client';

import { useState } from 'react';
import { updateConnectionStatus } from '@/lib/connections';
import { useNotifications } from '@/components/ActionNotification';

interface StatusSelectorProps {
  connectionId: string;
  currentStatus: string;
}

// Status options with their colors
const statusOptions = [
  { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-800' },
  { value: 'contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'responded', label: 'Responded', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'meeting', label: 'Meeting Scheduled', color: 'bg-purple-100 text-purple-800' },
  { value: 'opportunity', label: 'Opportunity', color: 'bg-green-100 text-green-800' },
  { value: 'closed', label: 'Closed', color: 'bg-green-200 text-green-900' },
  { value: 'not-interested', label: 'Not Interested', color: 'bg-red-100 text-red-800' },
  { value: 'will-not-contact', label: 'Will Not Contact', color: 'bg-gray-300 text-gray-800' }
];

export default function StatusSelector({ connectionId, currentStatus }: StatusSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const { addNotification } = useNotifications();
  
  // Find the current status object
  const currentStatusObj = statusOptions.find(option => option.value === status) || statusOptions[0];
  
  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  // Handle status selection
  const handleSelectStatus = async (newStatus: string) => {
    if (newStatus === status) {
      setIsOpen(false);
      return;
    }
    
    setIsUpdating(true);
    
    try {
      const result = await updateConnectionStatus(connectionId, newStatus);
      
      if (result.connection) {
        setStatus(newStatus);
        
        // Show notification if reminders were cleared
        if (result.clearedReminders > 0) {
          const message = result.clearedReminders === 1
            ? '1 reminder was automatically completed due to status change'
            : `${result.clearedReminders} reminders were automatically completed due to status change`;
          
          addNotification('reminder_completed', message);
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
      setIsOpen(false);
    }
  };
  
  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleDropdown}
        disabled={isUpdating}
        className={`px-3 py-1 rounded-full text-sm inline-flex items-center ${currentStatusObj.color} ${isUpdating ? 'opacity-50' : ''}`}
      >
        {isUpdating ? 'Updating...' : currentStatusObj.label}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-4 w-4 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-md py-1 z-10">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelectStatus(option.value)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${option.value === status ? 'font-semibold' : ''}`}
            >
              <span className={`inline-block w-3 h-3 rounded-full mr-2 ${option.color.replace('text-', 'bg-').replace('-100', '-600')}`}></span>
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 