'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { loadConnections, updateConnectionStatus } from '@/lib/connections';
import { Connection, Tag } from '@/lib/types';
import FilterPanel, { FilterOptions } from './FilterPanel';
import StatusDropdown from './StatusDropdown';

interface ConnectionsListProps {
  initialConnections: Connection[];
  allTags: Tag[];
}

export default function ConnectionsList({ initialConnections, allTags }: ConnectionsListProps) {
  const [connections, setConnections] = useState<Connection[]>(initialConnections);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    statuses: [],
    tags: [],
    tagFilterMode: 'OR',
    searchTerm: ''
  });
  const [filteredConnections, setFilteredConnections] = useState<Connection[]>(initialConnections);
  const [isLoading, setIsLoading] = useState(false);
  
  // Function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'responded':
        return 'bg-indigo-100 text-indigo-800';
      case 'meeting':
        return 'bg-purple-100 text-purple-800';
      case 'opportunity':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-green-200 text-green-900';
      case 'not-interested':
        return 'bg-red-100 text-red-800';
      case 'will-not-contact':
        return 'bg-gray-300 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Function to fetch connections filtered by tags
  const fetchConnectionsByTags = async (tagIds: string[], mode: 'OR' | 'AND') => {
    if (tagIds.length === 0) return null;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/connections-by-tags?tagIds=${tagIds.join(',')}&mode=${mode}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch connections by tags');
      }
      
      const data = await response.json();
      return data.connections;
    } catch (error) {
      console.error('Error fetching connections by tags:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilterOptions(newFilters);
    
    // Update the search term if it changed
    if (newFilters.searchTerm !== searchTerm) {
      setSearchTerm(newFilters.searchTerm || '');
    }
  };
  
  // Filter connections based on all criteria
  useEffect(() => {
    const filterConnections = async () => {
      setIsLoading(true);
      
      try {
        let results = [...initialConnections];
        
        // If tags are selected, fetch connections by tags first
        if (filterOptions.tags.length > 0) {
          const taggedConnections = await fetchConnectionsByTags(
            filterOptions.tags, 
            filterOptions.tagFilterMode
          );
          
          if (taggedConnections) {
            results = taggedConnections;
          }
        }
        
        // Filter by search term
        if (searchTerm) {
          const term = searchTerm.toLowerCase().trim();
          results = results.filter(connection => {
            const fullName = `${connection.firstName.toLowerCase()} ${connection.lastName.toLowerCase()}`;
            const lastFirst = `${connection.lastName.toLowerCase()} ${connection.firstName.toLowerCase()}`;
            
            return (
              fullName.includes(term) ||
              lastFirst.includes(term) ||
              connection.firstName.toLowerCase().includes(term) ||
              connection.lastName.toLowerCase().includes(term) ||
              (connection.company && connection.company.toLowerCase().includes(term)) ||
              (connection.position && connection.position.toLowerCase().includes(term))
            );
          });
        }
        
        // Filter by status
        if (filterOptions.statuses.length > 0) {
          results = results.filter(connection => 
            filterOptions.statuses.includes(connection.status || 'new')
          );
        }
        
        setFilteredConnections(results);
      } finally {
        setIsLoading(false);
      }
    };
    
    filterConnections();
  }, [initialConnections, searchTerm, filterOptions]);
  
  if (initialConnections.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-lg text-gray-600">No connections found.</p>
        <p className="text-gray-500">Import your LinkedIn connections to get started.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name, company, or position..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setFilterOptions(prev => ({ ...prev, searchTerm: e.target.value }));
            }}
            className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>
        
        {/* Filter Panel */}
        <FilterPanel 
          allTags={allTags} 
          onFilterChange={handleFilterChange}
          initialFilters={filterOptions}
        />
        
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">
            {isLoading 
              ? 'Loading connections...' 
              : `Showing ${filteredConnections.length} of ${initialConnections.length} connections`
            }
          </p>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredConnections.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 overflow-visible">
          {filteredConnections.map(connection => (
            <div 
              key={connection.id} 
              className="bg-white rounded-lg shadow-md overflow-visible border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className="p-4 overflow-visible">
                <div className="flex justify-between items-start overflow-visible">
                  <h3 className="text-lg font-bold">
                    {connection.firstName} {connection.lastName}
                  </h3>
                  
                  {connection.status && (
                    <StatusDropdown 
                      connectionId={connection.id}
                      currentStatus={connection.status}
                      onStatusChange={(newStatus) => {
                        // Update both the filtered connections and the original connections array
                        const updatedFiltered = filteredConnections.map(conn => 
                          conn.id === connection.id 
                            ? { ...conn, status: newStatus } 
                            : conn
                        );
                        setFilteredConnections(updatedFiltered);
                        
                        // Also update the original connections array
                        const updatedOriginal = connections.map(conn => 
                          conn.id === connection.id 
                            ? { ...conn, status: newStatus } 
                            : conn
                        );
                        setConnections(updatedOriginal);
                      }}
                    />
                  )}
                </div>
                
                {(connection.position || connection.company) && (
                  <p className="text-gray-600 text-sm mt-1">
                    {connection.position}{connection.position && connection.company ? ' at ' : ''}
                    {connection.company}
                  </p>
                )}
                
                {connection.lastContactedAt && (
                  <p className="text-gray-500 text-xs mt-1">
                    Last contacted: {new Date(connection.lastContactedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              
              <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 flex justify-between">
                <Link
                  href={`/connection/${connection.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Details
                </Link>
                
                <div className="flex space-x-2">
                  <Link
                    href={`/connection/${connection.id}/message`}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Message
                  </Link>
                  
                  <a
                    href={connection.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-800 text-sm"
                  >
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-lg text-gray-600">No matching connections found.</p>
          <p className="text-gray-500">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
} 