'use client';

import React, { useState, useEffect, useRef } from 'react';
import BotCard from '@/components/bot-display/bot-card/bot-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, List, Grid3X3, Star } from 'lucide-react';

// Model filter options
const MODEL_OPTIONS = ['All Models', 'Claude', 'GPT-4', 'Mistral', 'Llama'];

// Sort options
const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'recent', label: 'Most Recent' },
];

// Define a function to create the bot data instead of direct imports
function createBotData() {
  // Sample base bots
  const baseBots = [
    {
      id: 'bot-1',
      name: 'Customer Support Bot',
      description: 'A helpful bot designed to handle customer inquiries and provide support for common issues.',
      prompt: 'You are a helpful and friendly customer support agent for a tech company.',
      rating: 9.2,
      copiesCreated: 587,
      model: 'Claude',
      imageUrl: 'https://utfs.io/f/ae34682c-5a6c-4320-92ca-681cd4d93376-plqwlq.jpg',
      createdAt: '2023-09-15',
    },
    {
      id: 'bot-2',
      name: 'Code Assistant',
      description: 'An AI assistant that helps with coding tasks, debugging, and explaining code concepts.',
      prompt: 'You are a coding assistant that helps developers write better code and solve programming problems.',
      rating: 9.7,
      copiesCreated: 1204,
      model: 'GPT-4',
      imageUrl: 'https://utfs.io/f/ae34682c-5a6c-4320-92ca-681cd4d93376-plqwlq.jpg',
      createdAt: '2023-08-22',
    },
    {
      id: 'bot-3',
      name: 'Marketing Copywriter',
      description: 'Creates engaging marketing copy for different platforms and audience segments.',
      prompt: 'You are a creative marketing copywriter who creates engaging and conversion-focused content.',
      rating: 8.5,
      copiesCreated: 372,
      model: 'Claude',
      imageUrl: 'https://utfs.io/f/ae34682c-5a6c-4320-92ca-681cd4d93376-plqwlq.jpg',
      createdAt: '2023-10-05',
    },
    {
      id: 'bot-4',
      name: 'Data Analyst',
      description: 'Helps analyze and interpret data, generate insights, and create visualizations.',
      prompt: 'You are a data analyst who helps users interpret data and derive meaningful insights.',
      rating: 8.9,
      copiesCreated: 318,
      model: 'Mistral',
      imageUrl: 'https://utfs.io/f/ae34682c-5a6c-4320-92ca-681cd4d93376-plqwlq.jpg',
      createdAt: '2023-11-12',
    },
    {
      id: 'bot-5',
      name: 'Learning Tutor',
      description: 'A patient tutor that explains concepts in simple terms and provides educational guidance.',
      prompt: 'You are a patient and knowledgeable tutor who specializes in breaking down complex concepts.',
      rating: 9.4,
      copiesCreated: 892,
      model: 'GPT-4',
      imageUrl: 'https://utfs.io/f/ae34682c-5a6c-4320-92ca-681cd4d93376-plqwlq.jpg',
      createdAt: '2023-07-30',
    },
  ];
  
  // Additional bots 
  const additionalBots = [
    {
      id: 'bot-6',
      name: 'Fitness Coach',
      description: 'A virtual fitness coach that provides workout routines, nutrition advice, and motivation.',
      prompt: 'You are a motivational fitness coach who helps users achieve their health and fitness goals.',
      rating: 8.7,
      copiesCreated: 243,
      model: 'Llama',
      imageUrl: 'https://utfs.io/f/ae34682c-5a6c-4320-92ca-681cd4d93376-plqwlq.jpg',
      createdAt: '2023-12-01',
    },
    {
      id: 'bot-7',
      name: 'Creative Writer',
      description: 'Assists with creative writing, generating ideas, and providing feedback on written content.',
      prompt: 'You are a creative writing assistant who helps users with their writing projects.',
      rating: 9.1,
      copiesCreated: 512,
      model: 'Claude',
      imageUrl: 'https://utfs.io/f/ae34682c-5a6c-4320-92ca-681cd4d93376-plqwlq.jpg',
      createdAt: '2023-09-28',
    },
    {
      id: 'bot-8',
      name: 'Research Assistant',
      description: 'Helps with academic research, finding sources, summarizing papers, and organizing information.',
      prompt: 'You are a research assistant who helps users find, synthesize, and organize academic information.',
      rating: 9.3,
      copiesCreated: 678,
      model: 'GPT-4',
      imageUrl: 'https://utfs.io/f/ae34682c-5a6c-4320-92ca-681cd4d93376-plqwlq.jpg',
      createdAt: '2023-10-15',
    },
  ];
  
  // Return the combined data
  return [...baseBots, ...additionalBots];
}

interface BotExplorerProps {
  // Add any props if needed in the future
}

export const BotExplorer = () => {
  // Create fresh bot data using useRef to prevent re-creation on renders
  const allBotsRef = useRef(createBotData());
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState('All Models');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredBots, setFilteredBots] = useState(allBotsRef.current);

  // Apply filters and sort
  useEffect(() => {
    let result = [...allBotsRef.current];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        bot => 
          bot.name.toLowerCase().includes(query) || 
          bot.description.toLowerCase().includes(query) ||
          bot.prompt.toLowerCase().includes(query)
      );
    }
    
    // Filter by model
    if (selectedModel !== 'All Models') {
      result = result.filter(bot => bot.model === selectedModel);
    }
    
    // Sort bots
    result = result.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.copiesCreated - a.copiesCreated;
        case 'rating':
          return b.rating - a.rating;
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });
    
    setFilteredBots(result);
  }, [searchQuery, selectedModel, sortBy]); // Removed allBots dependency

  const handleModelChange = (value: string) => {
    setSelectedModel(value);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedModel('All Models');
    setSortBy('popular');
  };

  return (
    <div className="w-full py-6 space-y-6">
      <h1 className="text-3xl text-center font-bold">Explore Bots</h1>
      
      {/* Filters and Controls - flex row in parent and filter divs 
      to ease separating search and filters and spacing */}
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
              {MODEL_OPTIONS.map((model) => (
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
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex items-center border rounded-md">
            <Button 
              variant={viewMode === 'grid' ? 'default' : 'ghost'} 
              size="sm" 
              className="rounded-r-none"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'default' : 'ghost'} 
              size="sm" 
              className="rounded-l-none"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Active filters display */}
      {(searchQuery || selectedModel !== 'All Models') && (
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Active filters:</span>
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <Badge variant="outline" className="flex items-center gap-1">
                Search: {searchQuery}
              </Badge>
            )}
            {selectedModel !== 'All Models' && (
              <Badge variant="outline" className="flex items-center gap-1">
                Model: {selectedModel}
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
        Showing {filteredBots.length} {filteredBots.length === 1 ? 'bot' : 'bots'}
      </div>
      
      {/* Bot displays */}
      {filteredBots.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-lg text-muted-foreground">No bots found matching your criteria.</p>
          <Button variant="link" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="pl-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBots.map((bot) => (
            <BotCard
              key={bot.id}
              {...bot}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBots.map((bot) => (
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
        </div>
      )}
    </div>
  );
}; 