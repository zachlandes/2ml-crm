'use client';

import { useState, useRef, useEffect } from 'react';
import { updateConnectionStatus } from '@/lib/connections';

interface StatusDropdownProps {
  connectionId: string;
  currentStatus: string;
  onStatusChange: (newStatus: string) => void;
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

export default function StatusDropdown({ connectionId, currentStatus, onStatusChange }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
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
      await updateConnectionStatus(connectionId, newStatus);
      onStatusChange(newStatus);
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
  
  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        disabled={isUpdating}
        className={`px-2 py-1 text-xs rounded-full flex items-center cursor-pointer ${currentStatusObj.color} ${isUpdating ? 'opacity-50' : 'hover:opacity-80'}`}
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
          className="absolute right-0 top-full mt-1 w-48 bg-white shadow-xl rounded-md py-1 z-[9999] max-h-80 overflow-y-auto"
          style={{ minWidth: '180px', position: 'absolute' }}
          onClick={(e) => e.stopPropagation()}
        >
          {statusOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectStatus(option.value, e);
              }}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-100 flex items-center ${option.value === currentStatus ? 'font-semibold' : ''}`}
            >
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${option.color.replace('text-', 'bg-').replace('-100', '-600')}`}></span>
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