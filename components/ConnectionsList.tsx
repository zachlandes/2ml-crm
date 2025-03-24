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
        return 'bg-primary/20 text-primary border-l-primary';
      case 'contacted':
        return 'bg-accent/20 text-accent-foreground border-l-accent';
      case 'responded':
        return 'bg-indigo-400/20 text-indigo-600 border-l-indigo-400';
      case 'meeting':
        return 'bg-secondary/20 text-secondary border-l-secondary';
      case 'opportunity':
        return 'bg-green-500/20 text-green-600 border-l-green-500';
      case 'closed':
        return 'bg-muted text-muted-foreground border-l-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground border-l-muted-foreground';
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
  
  // Handle filter changes from FilterPanel
  const handleFilterChange = (newFilters: FilterOptions) => {
    // Only update filters, don't modify search term state to avoid circular updates
    setFilterOptions(prevFilters => ({
      ...newFilters,
      searchTerm: searchTerm // Keep using our controlled search term
    }));
  };
  
  // Handle search with local filtering instead of through filterOptions
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    // Skip the effect chain for better performance
    applyFilters(term, filterOptions.statuses, filterOptions.tags, filterOptions.tagFilterMode);
  };
  
  // Directly apply filters instead of relying on effects
  const applyFilters = async (
    term: string, 
    statuses: string[], 
    tags: string[], 
    tagMode: 'OR' | 'AND'
  ) => {
    try {
      setIsLoading(true);
      let results = [...initialConnections];
      
      // If we have tag filters, fetch them from the API
      if (tags.length > 0) {
        const taggedConnections = await fetchConnectionsByTags(tags, tagMode);
        if (taggedConnections) {
          results = taggedConnections;
        }
      }
      
      // Filter by search term
      if (term) {
        const searchTerm = term.toLowerCase().trim();
        results = results.filter(connection => {
          const fullName = `${connection.firstName.toLowerCase()} ${connection.lastName.toLowerCase()}`;
          const lastFirst = `${connection.lastName.toLowerCase()} ${connection.firstName.toLowerCase()}`;
          
          return (
            fullName.includes(searchTerm) ||
            lastFirst.includes(searchTerm) ||
            connection.firstName.toLowerCase().includes(searchTerm) ||
            connection.lastName.toLowerCase().includes(searchTerm) ||
            (connection.company && connection.company.toLowerCase().includes(searchTerm)) ||
            (connection.position && connection.position.toLowerCase().includes(searchTerm))
          );
        });
      }
      
      // Filter by status
      if (statuses.length > 0) {
        results = results.filter(connection => 
          statuses.includes(connection.status || 'new')
        );
      }
      
      setFilteredConnections(results);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Apply filters when filterOptions change (but not when searchTerm changes)
  useEffect(() => {
    // Don't run this effect when only searchTerm changes
    applyFilters(
      searchTerm, 
      filterOptions.statuses, 
      filterOptions.tags, 
      filterOptions.tagFilterMode
    );
  }, [initialConnections, filterOptions.statuses, filterOptions.tags, filterOptions.tagFilterMode]);
  
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
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start">
        <div className="relative w-full md:w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search connections..."
            className="w-full bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary py-2 pl-3 pr-10 rounded-none"
          />
          {searchTerm && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          )}
        </div>
        
        <FilterPanel 
          allTags={allTags} 
          onFilterChange={handleFilterChange} 
          initialFilters={filterOptions}
        />
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <div className="inline-block h-6 w-6 border-2 border-primary/50 border-t-primary rounded-full animate-spin"></div>
          <p className="mt-2 text-muted-foreground">Loading connections...</p>
        </div>
      ) : filteredConnections.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-muted-foreground/30">
          <p className="text-muted-foreground">No connections found matching your filters.</p>
          <Button 
            onClick={() => handleFilterChange({ statuses: [], tags: [], tagFilterMode: 'OR', searchTerm: '' })}
            className="mt-4 bg-primary hover:bg-primary/90"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 relative">
          {filteredConnections.map((connection, index) => (
            <Card 
              key={connection.id} 
              className={`bauhaus-card border-l-4 ${getStatusColor(connection.status || 'new')}`}
              style={{ zIndex: filteredConnections.length - index }}
            >
              <CardContent className="p-0 overflow-visible">
                <div className="flex flex-col sm:flex-row overflow-visible">
                  <div className="border-b sm:border-b-0 sm:border-r border-border sm:w-64 p-4 overflow-visible">
                    <Link 
                      href={`/connection/${connection.id}`}
                      className="font-medium hover:text-primary transition-colors block mb-1"
                    >
                      {connection.firstName} {connection.lastName}
                    </Link>
                    <p className="text-sm text-muted-foreground mb-2">
                      {connection.company || 'No company'}
                    </p>
                    <div className="relative isolate">
                      <StatusDropdown 
                        connectionId={connection.id} 
                        currentStatus={connection.status || 'new'} 
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
                    </div>
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex flex-col">
                      <p className="text-sm line-clamp-2 mb-2">
                        {connection.notes 
                          ? connection.notes.substring(0, 150) + (connection.notes.length > 150 ? '...' : '')
                          : <span className="text-muted-foreground italic">No notes yet</span>
                        }
                      </p>
                      
                      {/* Tags section - conditionally render if connection has tag property */}
                      {(connection as any).tags && (connection as any).tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-auto">
                          {((connection as any).tags || []).map((tag: Tag) => (
                            <span 
                              key={tag.id} 
                              className="inline-flex items-center px-2 py-1 text-xs bg-muted text-muted-foreground border-l-2 border-primary"
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 