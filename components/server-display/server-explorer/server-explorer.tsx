'use client';

import React, { useState, useEffect, useRef } from 'react';
import ServerCard from '@/components/server-display/server-card/server-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, List, Grid3X3 } from 'lucide-react';
import { CATEGORY_COLORS } from "@/lib/config/categories";
import { Server } from '@/lib/entities/server-display-types';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { VIEW_MODES } from '@/lib/config/ui-constants';

// Placeholder/Adapted Config (Ideally from lib/config/server-explorer.ts)
const SERVER_CATEGORY_OPTIONS = ['All Categories', ...Object.keys(CATEGORY_COLORS)];
const SERVER_SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' }, // Based on usageCount
  { value: 'recent', label: 'Most Recent' },
  { value: 'name', label: 'Name (A-Z)' }, // Added for name sorting
];
const SERVER_PAGINATION = { PAGE_SIZE: 12 }; // Example page size
const SERVER_EXPLORER_DEFAULTS = {
  SORT: 'popular',
  CATEGORY: 'All Categories',
  VIEW_MODE: 'grid' as 'grid' | 'list',
};

interface ServerExplorerProps {
  initialServers: Server[];
  totalServers: number;
  defaultSort: 'popular' | 'recent' | 'name';
  defaultCategory: string;
  defaultSearchQuery: string;
  currentUserId?: string;
  pageSize: number;
}

const ServerExplorer = ({
  initialServers,
  totalServers,
  defaultSort,
  defaultCategory,
  defaultSearchQuery,
  currentUserId,
  pageSize,
}: ServerExplorerProps) => {
  const [searchQuery, setSearchQuery] = useState(defaultSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [sortBy, setSortBy] = useState(defaultSort);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(SERVER_EXPLORER_DEFAULTS.VIEW_MODE);
  const [filterMode, setFilterMode] = useState<'all' | 'my'>('all');
  
  const loaderRef = useRef<HTMLDivElement>(null);

  const fetchServers = async ({ pageParam = 1 }) => {
    const params = new URLSearchParams({
      page: pageParam.toString(),
      pageSize: pageSize.toString(),
      sort: sortBy,
      category: selectedCategory,
      searchQuery,
      isPublic: 'true', // Fetch only public templates by default in explorer
    });

    if (filterMode === 'my' && currentUserId) {
      params.append('creatorId', currentUserId);
    }

    // This endpoint /api/templates/servers needs to be created to handle these params
    const response = await axios.get(`/api/templates/servers?${params.toString()}`);
    return response.data; // Expects { servers: Server[], total: number }
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isPending,
    isError,
    isSuccess,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['servers', searchQuery, selectedCategory, sortBy, filterMode, currentUserId],
    queryFn: fetchServers,
    initialPageParam: 1,
    initialData: {
      pages: [{ servers: initialServers, total: totalServers }],
      pageParams: [1]
    },
    getNextPageParam: (lastPage, pages) => {
      const nextPage = pages.length + 1;
      return nextPage * pageSize <= (lastPage.total || 0) ? nextPage : undefined;
    },
    enabled: typeof window !== 'undefined', // Only run query on client-side initially
  });

  // Refetch when primary filters change
  useEffect(() => {
    // Don't refetch on initial mount if initialData is present from SSR
    if (data?.pages.length === 1 && data.pages[0].servers === initialServers) {
      return;
    }
    refetch();
  }, [searchQuery, selectedCategory, sortBy, filterMode, currentUserId, refetch]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, loaderRef]);


  const handleCategoryChange = (value: string) => setSelectedCategory(value);
  const handleSortChange = (value: string) => setSortBy(value as 'popular' | 'recent' | 'name');
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value);
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(SERVER_EXPLORER_DEFAULTS.CATEGORY);
    setSortBy(SERVER_EXPLORER_DEFAULTS.SORT as 'popular' | 'recent' | 'name');
    setFilterMode('all');
  };

  const allServers = data?.pages.flatMap(page => page.servers) ?? [];

  return (
    <div className="w-full py-6 space-y-6">
      <div className="flex items-center px-4 relative">
        <h1 className="text-3xl font-bold absolute left-1/2 transform -translate-x-1/2">Explore Server Templates</h1>
        <div className="flex gap-2 ml-auto">
          <Button 
            variant={filterMode === 'all' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setFilterMode('all')} 
          >
            All Templates
          </Button>
          <Button 
            variant={filterMode === 'my' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => {
              if (currentUserId) setFilterMode('my');
              else console.warn("CurrentUserId not available for 'My Templates' filter in ServerExplorer.");
            }} 
          >
            My Templates
          </Button>
        </div>
      </div>
      
      <div className="flex w-full flex-row gap-4 justify-center items-center px-4">
        <div className="relative flex-grow max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search templates by name or description..." 
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-row gap-2 sm:flex-row sm:gap-4 items-center">
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {SERVER_CATEGORY_OPTIONS.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SERVER_SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex items-center border rounded-md">
            <Button 
              variant={viewMode === VIEW_MODES.GRID ? 'default' : 'ghost'} 
              size="sm" 
              className="rounded-r-none"
              onClick={() => setViewMode(VIEW_MODES.GRID)}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === VIEW_MODES.LIST ? 'default' : 'ghost'} 
              size="sm" 
              className="rounded-l-none"
              onClick={() => setViewMode(VIEW_MODES.LIST)}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {(searchQuery || selectedCategory !== SERVER_EXPLORER_DEFAULTS.CATEGORY || (filterMode === 'my' && currentUserId)) && (
        <div className="px-4 flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Active filters:</span>
          <div className="flex flex-wrap gap-2">
            {searchQuery && <Badge variant="outline">Search: {searchQuery}</Badge>}
            {selectedCategory !== SERVER_EXPLORER_DEFAULTS.CATEGORY && <Badge variant="outline">Category: {selectedCategory}</Badge>}
            {filterMode === 'my' && currentUserId && <Badge variant="outline">My Templates</Badge>}
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={clearFilters}>Clear all</Button>
          </div>
        </div>
      )}
      
      <div className="px-4 text-sm text-muted-foreground">
         Showing {allServers.length} of {data?.pages[0]?.total ?? 0} server templates
      </div>
      
      {isPending && <p className="px-4 text-center">Loading...</p>}
      {isError && <p className="px-4 text-center text-red-500">Error fetching server templates.</p>}
      
      {allServers.length === 0 && isSuccess && (
        <div className="py-12 text-center px-4">
          <p className="text-lg text-muted-foreground">No server templates found matching your criteria.</p>
          <Button variant="link" onClick={clearFilters}>Clear filters</Button>
        </div>
      )}

      {allServers.length > 0 && viewMode === VIEW_MODES.GRID && (
        <div className="px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {allServers.map((server) => (
            <ServerCard key={server.id} {...server} />
          ))}
        </div>
      )}
      {allServers.length > 0 && viewMode === VIEW_MODES.LIST && (
        <div className="px-4 space-y-4">
          {allServers.map((server) => (
            // Simplified List Item - can be expanded similar to BotExplorer if needed
            <div key={server.id} className="flex gap-4 p-4 border rounded-lg bg-zinc-900/30 hover:bg-zinc-800/50 transition-colors">
              <img src={server.imageUrl} alt={server.name} className="w-16 h-16 rounded-md object-cover"/>
              <div className="flex-grow">
                <h3 className="font-semibold text-lg text-zinc-100">{server.name}</h3>
                <p className="text-xs text-zinc-400 line-clamp-2">{server.description}</p>
                 <div className="text-xs text-zinc-500 mt-1">
                    Category: {server.category} | Copies: {server.usageCount}
                    {server.creator?.username && ` | By: ${server.creator.username}`}
                 </div>
              </div>
              <Button size="sm" onClick={() => console.log('Use template:', server.id)}>Use Template</Button> 
            </div>
          ))}
        </div>
      )}
       <div ref={loaderRef} className="h-10 col-span-full" />
       {isFetchingNextPage && <p className="text-center py-4 col-span-full">Loading more...</p>}
    </div>
  );
};

export default ServerExplorer; 