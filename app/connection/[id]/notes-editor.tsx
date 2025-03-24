'use client';

import { useState } from 'react';
import { updateConnectionNotes, addConnectionNote } from '@/lib/connections';
import { Connection } from '@/lib/types';

interface NotesEditorProps {
  connection: Connection;
}

export default function NotesEditor({ connection }: NotesEditorProps) {
  const [notes, setNotes] = useState(connection.notes || '');
  const [quickNote, setQuickNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Handle change in the notes textarea
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };
  
  // Handle saving of notes
  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      await updateConnectionNotes(connection.id, notes);
      setSaveSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle change in the quick note input
  const handleQuickNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuickNote(e.target.value);
  };
  
  // Handle adding a quick note
  const handleAddQuickNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNote.trim()) return;
    
    setIsAdding(true);
    
    try {
      await addConnectionNote(connection.id, quickNote, 'quick_note');
      setQuickNote('');
      // Append the quick note to the existing notes
      setNotes(prev => {
        const now = new Date().toLocaleString();
        return `${prev ? prev + '\n\n' : ''}[${now}] ${quickNote}`;
      });
    } catch (error) {
      console.error('Error adding quick note:', error);
    } finally {
      setIsAdding(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <form onSubmit={handleSaveNotes} className="space-y-4">
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Detailed Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={handleNotesChange}
            className="w-full h-40 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add detailed notes about this connection..."
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Notes'}
          </button>
        </div>
        
        {saveSuccess && (
          <div className="p-3 bg-green-100 text-green-800 rounded-md">
            Notes saved successfully!
          </div>
        )}
      </form>
      
      <div className="border-t pt-6">
        <form onSubmit={handleAddQuickNote} className="flex space-x-3">
          <input
            type="text"
            value={quickNote}
            onChange={handleQuickNoteChange}
            className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add a quick note or activity..."
          />
          
          <button
            type="submit"
            disabled={isAdding || !quickNote.trim()}
            className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 disabled:opacity-50"
          >
            {isAdding ? 'Adding...' : 'Add'}
          </button>
        </form>
      </div>
    </div>
  );
} 