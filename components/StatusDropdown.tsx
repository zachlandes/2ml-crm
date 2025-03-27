'use client';

import { useState, useRef, useEffect } from 'react';
import { updateConnectionStatus } from '@/lib/connections';
import { useNotifications } from './ActionNotification';

interface StatusDropdownProps {
  connectionId: string;
  currentStatus: string;
  onStatusChange: (newStatus: string) => void;
}

// Status options with their colors
const statusOptions = [
  { value: 'new', label: 'New', color: 'bg-primary/20 text-primary' },
  { value: 'contacted', label: 'Contacted', color: 'bg-accent/20 text-accent-foreground' },
  { value: 'responded', label: 'Responded', color: 'bg-indigo-400/20 text-indigo-600' },
  { value: 'meeting', label: 'Meeting Scheduled', color: 'bg-secondary/20 text-secondary' },
  { value: 'opportunity', label: 'Opportunity', color: 'bg-green-500/20 text-green-600' },
  { value: 'closed', label: 'Closed', color: 'bg-muted text-muted-foreground' },
  { value: 'not-interested', label: 'Not Interested', color: 'bg-destructive/20 text-destructive' },
  { value: 'will-not-contact', label: 'Will Not Contact', color: 'bg-muted text-muted-foreground' }
];

export default function StatusDropdown({ connectionId, currentStatus, onStatusChange }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { addNotification } = useNotifications();
  
  // Find the current status object
  const currentStatusObj = statusOptions.find(option => option.value === currentStatus) || statusOptions[0];
  
  // Handle status selection
  const handleSelectStatus = async (newStatus: string, e: React.MouseEvent) => {
    // Stop the event from propagating
    e.preventDefault();
    e.stopPropagation();
    
    if (newStatus === currentStatus || isUpdating) {
      setIsOpen(false);
      return;
    }
    
    setIsUpdating(true);
    
    try {
      const result = await updateConnectionStatus(connectionId, newStatus);
      
      if (result.connection) {
        onStatusChange(newStatus);
        
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
  
  // Close the dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [containerRef]);
  
  // Add/remove class on document body when dropdown is open
  useEffect(() => {
    if (isOpen) {
      // Add a class to the closest card when dropdown is open
      const card = containerRef.current?.closest('.bauhaus-card');
      if (card) {
        card.classList.add('has-active-dropdown');
      }
    } else {
      // Remove the class when dropdown is closed
      const card = containerRef.current?.closest('.bauhaus-card');
      if (card) {
        card.classList.remove('has-active-dropdown');
      }
    }
  }, [isOpen]);
  
  return (
    <div 
      className={`relative inline-block status-dropdown ${isOpen ? 'status-dropdown-active' : ''}`} 
      ref={containerRef}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        disabled={isUpdating}
        className={`px-2 py-1 text-xs rounded-none border-l-2 flex items-center cursor-pointer ${currentStatusObj.color} ${isUpdating ? 'opacity-50' : 'hover:opacity-80'}`}
        title="Click to change status"
      >
        {isUpdating ? 'Updating...' : currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-3 w-3 ml-1" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div 
          className="absolute left-0 top-full mt-1 w-48 bg-card shadow-xl border border-border rounded-none py-1 max-h-80 overflow-y-auto status-dropdown-menu"
          style={{ minWidth: '180px', maxWidth: '200px' }}
          onClick={(e) => e.stopPropagation()}
          data-status-dropdown="true"
        >
          {statusOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectStatus(option.value, e);
              }}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-muted flex items-center ${option.value === currentStatus ? 'font-semibold' : ''}`}
            >
              <span className={`inline-block w-2 h-2 mr-2 border-l-2 ${option.color.replace('text-', 'border-')}`}></span>
              {option.label}
              {option.value === currentStatus && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 