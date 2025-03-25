'use client';

import { useState } from 'react';

interface ActivityItem {
  id: string;
  connectionId: string;
  content: string;
  type: string;
  createdAt: string;
  status?: string;
}

interface ActivityTimelineProps {
  activities: ActivityItem[];
}

// Simple Modal Component
function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  content,
  isLoading
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  title: string; 
  content: string;
  isLoading: boolean;
}) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[80vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <div className="mb-6 text-sm text-gray-600 whitespace-pre-wrap border-l-4 border-red-500 pl-3 py-2 bg-red-50 rounded">
          {content}
        </div>
        <div className="flex justify-end space-x-3">
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 disabled:opacity-50 flex items-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localActivities, setLocalActivities] = useState<ActivityItem[]>(activities);
  
  // Function to handle delete click
  const handleDeleteClick = (activity: ActivityItem) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };
  
  // Function to handle delete confirmation
  const handleConfirmDelete = async () => {
    if (!selectedActivity) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch('/api/notes/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: selectedActivity.id }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Remove the deleted activity from the local state
        setLocalActivities(prev => prev.filter(a => a.id !== selectedActivity.id));
        setIsModalOpen(false);
      } else {
        console.error('Failed to delete note:', data.error);
        alert('Failed to delete note. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  };
  
  // Function to get activity icon based on type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'message_sent':
      case 'message':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        );
      case 'note_updated':
      case 'note':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
          </svg>
        );
      case 'status_updated':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'quick_note':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-10a1 1 0 01.707.293l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 8 11.293 4.707a1 1 0 010-1.414A1 1 0 0112 3z" clipRule="evenodd" />
          </svg>
        );
      case 'reminder_created':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      case 'reminder_completed':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        );
    }
  };
  
  // Function to get activity title based on type
  const getActivityTitle = (type: string) => {
    switch (type) {
      case 'message':
      case 'message_sent':
        return 'Message Sent';
      case 'note':
      case 'note_updated':
        return 'Notes Updated';
      case 'status_updated':
        return 'Status Updated';
      case 'quick_note':
        return 'Quick Note Added';
      case 'reminder_created':
        return 'Reminder Created';
      case 'reminder_completed':
        return 'Reminder Completed';
      default:
        return 'Activity';
    }
  };
  
  // Function to format content based on type
  const formatContent = (content: string, type: string) => {
    // For note updates, make sure to display the content properly
    if (type === 'note_updated') {
      // If content is very long, show only a preview
      const maxLength = 500;
      if (content && content.length > maxLength) {
        return content.substring(0, maxLength) + '...';
      }
    }
    
    return content;
  };
  
  // Function to determine if an activity can be deleted
  const canDelete = (type: string) => {
    // Only allow deletion of notes and quick notes
    return ['note', 'note_updated', 'quick_note'].includes(type);
  };
  
  if (localActivities.length === 0) {
    return (
      <div className="text-gray-500 text-center py-6">
        No activities found.
      </div>
    );
  }
  
  return (
    <div className="relative pl-8">
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200"></div>
      
      <div className="space-y-8">
        {localActivities.map((activity) => (
          <div key={activity.id} className="relative">
            {getActivityIcon(activity.type)}
            
            <div className="ml-6">
              <div className="flex justify-between">
                <h3 className="font-medium">{getActivityTitle(activity.type)}</h3>
                <div className="flex items-center space-x-3">
                  <time className="text-sm text-gray-500">{formatDate(activity.createdAt)}</time>
                  {canDelete(activity.type) && (
                    <button 
                      onClick={() => handleDeleteClick(activity)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              <div className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                {formatContent(activity.content, activity.type)}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => isDeleting ? null : setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete this note?"
        content={selectedActivity?.content || ''}
        isLoading={isDeleting}
      />
    </div>
  );
} 