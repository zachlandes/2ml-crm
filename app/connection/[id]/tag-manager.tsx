'use client';

import { useState } from 'react';
import { createTag, addTagToConnection, removeTagFromConnection, getAllTags } from '@/lib/connections';

interface Tag {
  id: string;
  name: string;
}

interface TagManagerProps {
  connectionId: string;
  existingTags: Tag[];
}

export default function TagManager({ connectionId, existingTags }: TagManagerProps) {
  const [tags, setTags] = useState<Tag[]>(existingTags || []);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  
  // Load all available tags
  const loadAvailableTags = async () => {
    try {
      const allTags = await getAllTags();
      
      // Filter out tags that are already assigned to the connection
      const existingTagIds = tags.map(tag => tag.id);
      const filteredTags = allTags.filter(tag => !existingTagIds.includes(tag.id));
      
      setAvailableTags(filteredTags);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };
  
  // Handle adding a new tag
  const handleAddNewTag = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTagName.trim()) return;
    
    setLoading(true);
    
    try {
      // Create a new tag
      const newTag = await createTag(newTagName.trim());
      
      if (newTag) {
        // Add the tag to the connection
        const added = await addTagToConnection(connectionId, newTag.id);
        
        if (added) {
          // Add to the list of tags
          setTags([...tags, newTag]);
        }
      }
      
      // Reset form
      setNewTagName('');
      setShowTagInput(false);
    } catch (error) {
      console.error('Error adding tag:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle selecting an existing tag
  const handleSelectTag = async (tag: Tag) => {
    setLoading(true);
    
    try {
      // Add the tag to the connection
      const added = await addTagToConnection(connectionId, tag.id);
      
      if (added) {
        // Add to the list of tags
        setTags([...tags, tag]);
        
        // Remove from available tags
        setAvailableTags(availableTags.filter(t => t.id !== tag.id));
      }
      
      // Hide dropdown
      setShowTagDropdown(false);
    } catch (error) {
      console.error('Error selecting tag:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle removing a tag
  const handleRemoveTag = async (tagId: string) => {
    setLoading(true);
    
    try {
      // Remove the tag from the connection
      const removed = await removeTagFromConnection(connectionId, tagId);
      
      if (removed) {
        // Remove from the list of tags
        const updatedTags = tags.filter(tag => tag.id !== tagId);
        setTags(updatedTags);
        
        // Add the tag back to available tags
        const removedTag = tags.find(tag => tag.id === tagId);
        if (removedTag) {
          setAvailableTags([...availableTags, removedTag]);
        }
      }
    } catch (error) {
      console.error('Error removing tag:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {tags.length > 0 ? (
          tags.map(tag => (
            <div 
              key={tag.id} 
              className="inline-flex items-center bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full"
            >
              {tag.name}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag.id)}
                className="ml-2 text-gray-500 hover:text-gray-700"
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))
        ) : (
          <span className="text-gray-500 text-sm">No tags added yet</span>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        {showTagInput ? (
          <form onSubmit={handleAddNewTag} className="flex items-center space-x-2">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="flex-1 px-3 py-1 text-sm border rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter new tag name"
              disabled={loading}
              autoFocus
            />
            <button
              type="submit"
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
              disabled={!newTagName.trim() || loading}
            >
              Add
            </button>
            <button
              type="button"
              className="text-sm bg-gray-200 text-gray-800 px-3 py-1 rounded-md hover:bg-gray-300"
              onClick={() => setShowTagInput(false)}
              disabled={loading}
            >
              Cancel
            </button>
          </form>
        ) : (
          <>
            <button
              type="button"
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
              onClick={() => setShowTagInput(true)}
              disabled={loading}
            >
              + New Tag
            </button>
            
            <div className="relative">
              <button
                type="button"
                className="text-sm bg-gray-200 text-gray-800 px-3 py-1 rounded-md hover:bg-gray-300"
                onClick={() => {
                  loadAvailableTags();
                  setShowTagDropdown(!showTagDropdown);
                }}
                disabled={loading}
              >
                Add Existing Tag
              </button>
              
              {showTagDropdown && (
                <div className="absolute left-0 mt-1 w-56 bg-white shadow-lg rounded-md py-1 z-10">
                  {availableTags.length > 0 ? (
                    availableTags.map(tag => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleSelectTag(tag)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        disabled={loading}
                      >
                        {tag.name}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      No available tags
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
} 