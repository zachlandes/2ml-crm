'use client';

import { useState, useEffect, useRef } from 'react';
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
  { value: 'new', label: 'New', color: 'bg-primary/20 border-l-2 border-primary' },
  { value: 'contacted', label: 'Contacted', color: 'bg-accent/20 border-l-2 border-accent' },
  { value: 'responded', label: 'Responded', color: 'bg-indigo-400/20 border-l-2 border-indigo-400' },
  { value: 'meeting', label: 'Meeting Scheduled', color: 'bg-secondary/20 border-l-2 border-secondary' },
  { value: 'opportunity', label: 'Opportunity', color: 'bg-green-500/20 border-l-2 border-green-500' },
  { value: 'closed', label: 'Closed', color: 'bg-muted border-l-2 border-muted-foreground' },
  { value: 'not-interested', label: 'Not Interested', color: 'bg-destructive/20 border-l-2 border-destructive' },
  { value: 'will-not-contact', label: 'Will Not Contact', color: 'bg-muted border-l-2 border-muted-foreground' }
];

export default function FilterPanel({ allTags, onFilterChange, initialFilters }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'tags'>('status');
  const [filters, setFilters] = useState<FilterOptions>(initialFilters || {
    statuses: [],
    tags: [],
    tagFilterMode: 'OR',
    searchTerm: ''
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Toggle dropdown
  const toggleDropdown = () => {
    setIsExpanded(!isExpanded);
  };

  // Extract current status and tag filters for easier access
  const { statuses: activeStatusFilters, tags: activeTagFilters, tagFilterMode } = filters;
  
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
  
  // Add/remove class on document body when dropdown is open
  useEffect(() => {
    if (isExpanded) {
      document.body.classList.add('filter-panel-open');
    } else {
      document.body.classList.remove('filter-panel-open');
    }
  }, [isExpanded]);
  
  return (
    <div className={`w-full md:w-auto filter-panel ${isExpanded ? 'filter-panel-active' : ''}`}>
      <div 
        className="relative"
        ref={dropdownRef}
      >
        <Button
          type="button"
          onClick={toggleDropdown}
          variant="outline"
          className="w-full md:w-auto border border-input bg-background hover:bg-muted flex items-center justify-between gap-2 rounded-none"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          <div className="flex -space-x-1 ml-1">
            {activeStatusFilters.length > 0 && (
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary/20 text-xs font-medium">
                {activeStatusFilters.length}
              </span>
            )}
            {activeTagFilters.length > 0 && (
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-accent/20 text-xs font-medium">
                {activeTagFilters.length}
              </span>
            )}
          </div>
        </Button>

        {isExpanded && (
          <Card className="absolute right-0 w-80 mt-2 border shadow-lg rounded-none border-l-4 border-l-primary filter-panel-dropdown">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Filter Connections</h3>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <Tabs defaultValue="status" className="w-full" onValueChange={(value) => setActiveTab(value as 'status' | 'tags')}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="status">Status</TabsTrigger>
                  <TabsTrigger value="tags">Tags</TabsTrigger>
                </TabsList>

                <div className="space-y-4">
                  {activeTab === 'status' && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center">
                        <div className="h-3 w-3 bg-primary mr-2"></div>
                        Status
                      </h4>
                      <div className="space-y-1.5">
                        {statusOptions.map(status => (
                          <div 
                            key={status.value}
                            className="flex items-center px-2 py-1.5 hover:bg-muted"
                            onClick={(e) => {
                              // Only toggle if not clicking on checkbox or label
                              const target = e.target as HTMLElement;
                              if (target.tagName !== 'INPUT' && target.tagName !== 'LABEL') {
                                toggleStatus(status.value);
                              }
                            }}
                          >
                            <Checkbox 
                              id={`status-${status.value}`}
                              checked={activeStatusFilters.includes(status.value)}
                              onCheckedChange={(checked) => {
                                if (checked !== 'indeterminate') toggleStatus(status.value);
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className="rounded-none data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                            />
                            <label 
                              htmlFor={`status-${status.value}`}
                              className="ml-2 text-sm flex items-center cursor-pointer flex-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className={`inline-block w-3 h-3 rounded-none mr-2 ${status.color}`}></span>
                              {status.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'tags' && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium flex items-center">
                          <div className="h-3 w-3 bg-accent mr-2"></div>
                          Tags
                        </h4>
                        
                        <div className="flex items-center space-x-2 text-xs">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setTagFilterMode('OR')}
                            className={`px-2 py-1 rounded-none h-auto ${tagFilterMode === 'OR' ? 'bg-accent/20 text-accent-foreground' : ''}`}
                          >
                            Any
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setTagFilterMode('AND')}
                            className={`px-2 py-1 rounded-none h-auto ${tagFilterMode === 'AND' ? 'bg-accent/20 text-accent-foreground' : ''}`}
                          >
                            All
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {allTags.map(tag => (
                          <div 
                            key={tag.id}
                            className="flex items-center px-2 py-1.5 hover:bg-muted"
                            onClick={(e) => {
                              // Only toggle if not clicking on checkbox or label
                              const target = e.target as HTMLElement;
                              if (target.tagName !== 'INPUT' && target.tagName !== 'LABEL') {
                                toggleTag(tag.id);
                              }
                            }}
                          >
                            <Checkbox 
                              id={`tag-${tag.id}`}
                              checked={activeTagFilters.includes(tag.id)}
                              onCheckedChange={(checked) => {
                                if (checked !== 'indeterminate') toggleTag(tag.id);
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className="rounded-none data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground"
                            />
                            <label 
                              htmlFor={`tag-${tag.id}`}
                              className="ml-2 text-sm cursor-pointer flex-1 flex items-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="inline-block w-2 h-2 bg-accent/30 mr-2 border-l-2 border-accent"></span>
                              {tag.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="text-xs rounded-none"
                  >
                    Clear All
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      onFilterChange(filters);
                      setIsExpanded(false);
                    }}
                    className="text-xs bg-primary hover:bg-primary/90 rounded-none"
                  >
                    Apply Filters
                  </Button>
                </div>
              </Tabs>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
} 