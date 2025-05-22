'use client';

import React, { useState, useEffect, useRef } from 'react';
import BotCard from '@/components/bot-display/bot-card/bot-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, List, Grid3X3, Star } from 'lucide-react';
import { Bot } from '@/lib/entities/bot-display-types';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
  BOT_MODEL_OPTIONS, 
  BOT_SORT_OPTIONS, 
  BOT_PAGINATION,
  BOT_EXPLORER_DEFAULTS
} from '@/lib/config/bot-explorer';
import { VIEW_MODES } from '@/lib/config/ui-constants';

interface BotExplorerProps {
  initialData: Bot[];
  totalBots: number;
  defaultSort: 'popular' | 'rating' | 'recent';
  defaultModel: string;
  defaultSearchQuery: string;
  currentUserId?: string;
}

const BotExplorer = ({
  initialData,
  totalBots,
  defaultSort,
  defaultModel,
  defaultSearchQuery,
  currentUserId
}: BotExplorerProps) => {
  // State
  const [searchQuery, setSearchQuery] = useState(defaultSearchQuery);
  const [selectedModel, setSelectedModel] = useState(defaultModel);
  const [sortBy, setSortBy] = useState(defaultSort);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(BOT_EXPLORER_DEFAULTS.VIEW_MODE);
  const [filterMode, setFilterMode] = useState<'all' | 'my'>('all');
  
  // Ref for infinite scroll
  const loaderRef = useRef<HTMLDivElement>(null);

  // Fetch function for react-query
  const fetchBots = async ({ pageParam = 1 }) => {
    const params = new URLSearchParams({
      page: pageParam.toString(),
      pageSize: BOT_PAGINATION.PAGE_SIZE.toString(),
      sort: sortBy,
      model: selectedModel,
      searchQuery
    });

    if (filterMode === 'my' && currentUserId) {
      params.append('creatorId', currentUserId);
    }

    const response = await axios.get(`/api/templates/bots?${params}`);
    return response.data;
  };

  // Setup infinite query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
    queryKey: ['bots', searchQuery, selectedModel, sortBy, filterMode, currentUserId],
    queryFn: fetchBots,
    initialPageParam: 1,
    initialData: {
      pages: [{ bots: initialData, total: totalBots }],
      pageParams: [1]
    },
    getNextPageParam: (lastPage, pages) => {
      const nextPage = pages.length + 1;
      return nextPage * BOT_PAGINATION.PAGE_SIZE <= lastPage.total ? nextPage : undefined;
    }
  });

  // Custom infinite scroll implementation
  useEffect(() => {
    const handleScroll = () => {
      if (loaderRef.current && hasNextPage && !isFetchingNextPage) {
        const loaderRect = loaderRef.current.getBoundingClientRect();
        // If the loader element is in the viewport
        if (loaderRect.top <= window.innerHeight && loaderRect.bottom >= 0) {
          fetchNextPage();
        }
      }
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Initial check in case the content doesn't fill the page
    handleScroll();
    
    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Handle filter changes
  const handleModelChange = (value: string) => {
    setSelectedModel(value);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value as 'popular' | 'rating' | 'recent');
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedModel(BOT_EXPLORER_DEFAULTS.MODEL);
    setSortBy(BOT_EXPLORER_DEFAULTS.SORT);
    setFilterMode('all');
  };

  // Get all bots from all pages
  const allBots = data?.pages.flatMap(page => page.bots) ?? [];

  return (
    <div className="w-full py-6 space-y-6">
      <div className="flex items-center px-4 relative">
        <h1 className="text-3xl font-bold absolute left-1/2 transform -translate-x-1/2">Explore Bots</h1>
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
              if (currentUserId) {
                setFilterMode('my');
              } else {
                console.warn("CurrentUserId not available for 'My Templates' filter.");
              }
            }}
          >
            My Templates
          </Button>
        </div>
      </div>
      
      {/* Filters and Controls */}
      <div className="flex w-full flex-row gap-4 justify-center items-center">
        <div className="relative w-1/2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search bots by name, description, or prompt..." 
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-row gap-2 sm:flex-row sm:gap-4">
          <Select value={selectedModel} onValueChange={handleModelChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Model" />
            </SelectTrigger>
            <SelectContent>
              {BOT_MODEL_OPTIONS.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {BOT_SORT_OPTIONS.map((option) => (
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
      
      {/* Active filters display */}
      {(searchQuery || selectedModel !== BOT_EXPLORER_DEFAULTS.MODEL || (filterMode === 'my' && currentUserId)) && (
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Active filters:</span>
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <Badge variant="outline" className="flex items-center gap-1">
                Search: {searchQuery}
              </Badge>
            )}
            {selectedModel !== BOT_EXPLORER_DEFAULTS.MODEL && (
              <Badge variant="outline" className="flex items-center gap-1">
                Model: {selectedModel}
              </Badge>
            )}
            {filterMode === 'my' && currentUserId && (
              <Badge variant="outline" className="flex items-center gap-1">
                My Templates
              </Badge>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs"
              onClick={clearFilters}
            >
              Clear all
            </Button>
          </div>
        </div>
      )}
      
      {/* Results count */}
      <div className="text-sm pl-5 text-muted-foreground">
        Showing {allBots.length} of {data?.pages[0]?.total ?? 0} bots
      </div>
      
      {/* Bot displays */}
      {allBots.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-lg text-muted-foreground">No bots found matching your criteria.</p>
          <Button variant="link" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      ) : viewMode === VIEW_MODES.GRID ? (
        <div className="pl-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {allBots.map((bot) => (
            <BotCard
              key={bot.id}
              {...bot}
            />
          ))}
          {/* Infinite scroll trigger */}
          <div ref={loaderRef} className="h-10" />
        </div>
      ) : (
        <div className="space-y-4">
          {allBots.map((bot) => (
            <div 
              key={bot.id} 
              className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg"
            >
              <div className="flex items-center gap-4 md:w-64">
                <div 
                  className="relative w-16 h-16 rounded-full overflow-hidden border-2"
                  style={{ borderColor: bot.model === 'Claude' ? '#7963d2' : bot.model === 'GPT-4' ? '#10a37f' : bot.model === 'Mistral' ? '#0095ff' : bot.model === 'Llama' ? '#ff4500' : '#888888' }}
                >
                  <img
                    src={bot.imageUrl}
                    alt={bot.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{bot.name}</h3>
                  <Badge variant="outline" className="text-xs mt-1">
                    {bot.model}
                  </Badge>
                </div>
              </div>
              <div className="flex-grow space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < Math.floor(bot.rating / 2) ? "fill-yellow-400 text-yellow-400" : "text-zinc-300"}
                      />
                    ))}
                    <span className="text-xs ml-1">{bot.rating.toFixed(1)}/10</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {bot.copiesCreated} copies created • Created: {bot.createdAt}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {bot.description}
                </p>
              </div>
            </div>
          ))}
          {/* Infinite scroll trigger */}
          <div ref={loaderRef} className="h-10" />
        </div>
      )}
      
      {/* Loading indicator */}
      {isFetchingNextPage && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">Loading more bots...</p>
        </div>
      )}
    </div>
  );
};

export default BotExplorer;