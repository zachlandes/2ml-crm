'use client';

import { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Tag } from '@/lib/types';

interface FilterPanelProps {
  allTags: Tag[];
  onFilterChange: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
}

export interface FilterOptions {
  statuses: string[];
  tags: string[];
  tagFilterMode: 'OR' | 'AND';
  dateRange?: {
    field: 'connectedOn' | 'lastContactedAt';
    start?: string;
    end?: string;
  };
  searchTerm?: string;
}

// Define status options
const statusOptions = [
  { value: 'new', label: 'New', color: 'bg-blue-100' },
  { value: 'contacted', label: 'Contacted', color: 'bg-yellow-100' },
  { value: 'responded', label: 'Responded', color: 'bg-indigo-100' },
  { value: 'meeting', label: 'Meeting Scheduled', color: 'bg-purple-100' },
  { value: 'opportunity', label: 'Opportunity', color: 'bg-green-100' },
  { value: 'closed', label: 'Closed', color: 'bg-green-200' },
  { value: 'not-interested', label: 'Not Interested', color: 'bg-red-100' },
  { value: 'will-not-contact', label: 'Will Not Contact', color: 'bg-gray-300' }
];

export default function FilterPanel({ allTags, onFilterChange, initialFilters }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(initialFilters || {
    statuses: [],
    tags: [],
    tagFilterMode: 'OR',
    searchTerm: ''
  });
  
  // Apply filters when they change
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);
  
  // Toggle status selection
  const toggleStatus = (status: string) => {
    setFilters(prev => {
      const newStatuses = prev.statuses.includes(status)
        ? prev.statuses.filter(s => s !== status)
        : [...prev.statuses, status];
      
      return { ...prev, statuses: newStatuses };
    });
  };
  
  // Toggle tag selection
  const toggleTag = (tagId: string) => {
    setFilters(prev => {
      const newTags = prev.tags.includes(tagId)
        ? prev.tags.filter(t => t !== tagId)
        : [...prev.tags, tagId];
      
      return { ...prev, tags: newTags };
    });
  };
  
  // Set tag filter mode (OR or AND)
  const setTagFilterMode = (mode: 'OR' | 'AND') => {
    setFilters(prev => ({ ...prev, tagFilterMode: mode }));
  };
  
  // Handle date range changes
  const handleDateRangeChange = (field: 'connectedOn' | 'lastContactedAt', start?: string, end?: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: { field, start, end }
    }));
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      statuses: [],
      tags: [],
      tagFilterMode: 'OR',
      searchTerm: filters.searchTerm
    });
  };
  
  return (
    <div className="mb-4">
      <div 
        className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm cursor-pointer border border-gray-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <Filter className="w-5 h-5 mr-2 text-gray-600" />
          <span className="font-medium">Filters</span>
          {(filters.statuses.length > 0 || filters.tags.length > 0) && (
            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
              {filters.statuses.length + filters.tags.length} active
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        )}
      </div>
      
      {isExpanded && (
        <Card className="mt-2 p-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Status Filters */}
            <div>
              <h3 className="font-medium mb-2">Status:</h3>
              <div className="grid grid-cols-2 gap-2">
                {statusOptions.map(status => (
                  <div 
                    key={status.value}
                    className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer ${
                      filters.statuses.includes(status.value) ? 'bg-gray-100' : ''
                    }`}
                    onClick={(e: React.MouseEvent) => {
                      // Don't toggle if the event originated from the checkbox or label
                      const target = e.target as HTMLElement;
                      if (target.tagName !== 'INPUT' && !target.closest('label')) {
                        toggleStatus(status.value);
                      }
                    }}
                  >
                    <Checkbox 
                      id={`status-${status.value}`}
                      checked={filters.statuses.includes(status.value)}
                      onCheckedChange={(checked) => {
                        if (checked !== 'indeterminate') {
                          toggleStatus(status.value);
                        }
                      }}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                      }}
                    />
                    <div className="flex items-center">
                      <span className={`inline-block w-3 h-3 rounded-full mr-2 ${status.color}`}></span>
                      <label 
                        htmlFor={`status-${status.value}`}
                        className="text-sm cursor-pointer"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          toggleStatus(status.value);
                        }}
                      >
                        {status.label}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Tag Filters */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Tags:</h3>
                {filters.tags.length > 0 && (
                  <Tabs 
                    value={filters.tagFilterMode}
                    onValueChange={(value: string) => setTagFilterMode(value as 'OR' | 'AND')}
                    className="h-8"
                  >
                    <TabsList className="bg-gray-100">
                      <TabsTrigger 
                        value="OR"
                        className="px-3 py-1 text-xs"
                        title="Show connections with ANY of the selected tags"
                      >
                        Any (OR)
                      </TabsTrigger>
                      <TabsTrigger 
                        value="AND"
                        className="px-3 py-1 text-xs"
                        title="Show connections with ALL of the selected tags"
                      >
                        All (AND)
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                )}
              </div>
              
              {allTags.length > 0 ? (
                <div className="max-h-[200px] overflow-y-auto p-1">
                  <div className="grid grid-cols-2 gap-2">
                    {allTags.map(tag => (
                      <div 
                        key={tag.id}
                        className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer ${
                          filters.tags.includes(tag.id) ? 'bg-gray-100' : ''
                        }`}
                        onClick={(e: React.MouseEvent) => {
                          // Don't toggle if the event originated from the checkbox or label
                          const target = e.target as HTMLElement;
                          if (target.tagName !== 'INPUT' && !target.closest('label')) {
                            toggleTag(tag.id);
                          }
                        }}
                      >
                        <Checkbox 
                          id={`tag-${tag.id}`}
                          checked={filters.tags.includes(tag.id)}
                          onCheckedChange={(checked) => {
                            if (checked !== 'indeterminate') {
                              toggleTag(tag.id);
                            }
                          }}
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                          }}
                        />
                        <label 
                          htmlFor={`tag-${tag.id}`}
                          className="text-sm cursor-pointer truncate"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            toggleTag(tag.id);
                          }}
                        >
                          {tag.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No tags available</p>
              )}
            </div>
          </div>
          
          {/* Date Range Filters - Can be added in the future */}
          
          {/* Filter Actions */}
          <div className="flex justify-end mt-4 pt-3 border-t border-gray-200">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="text-sm"
              disabled={filters.statuses.length === 0 && filters.tags.length === 0}
            >
              Clear Filters
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
} 