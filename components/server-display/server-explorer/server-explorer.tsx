'use client';

import React, { useState, useEffect } from 'react';
import ServerCard from '@/components/server-display/server-card/server-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, List, Grid3X3, Star, Users } from 'lucide-react';

// Category filter options
const CATEGORY_OPTIONS = ['All Categories', 'Gaming', 'Technology', 'Education', 'Art', 'Community'];

// Sort options
const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'active', label: 'Most Active' },
  { value: 'recent', label: 'Most Recent' },
];

// Define a function to create the server data instead of direct imports
function createServerData() {
  // Sample base servers
  const baseServers = [
    {
      id: 'server-1',
      name: 'Gaming Hub',
      description: 'A community for gamers to discuss their favorite games, find teammates, and share gaming news and tips.',
      category: 'Gaming',
      rating: 9.2,
      memberCount: 1587,
      activeMembers: 342,
      imageUrl: 'https://utfs.io/f/ae34682c-5a6c-4320-92ca-681cd4d93376-plqwlq.jpg',
      createdAt: '2023-09-15',
    },
    {
      id: 'server-2',
      name: 'Code Masters',
      description: 'A server for developers to collaborate, share resources, and help each other with coding challenges.',
      category: 'Technology',
      rating: 9.5,
      memberCount: 2104,
      activeMembers: 487,
      imageUrl: 'https://utfs.io/f/ae34682c-5a6c-4320-92ca-681cd4d93376-plqwlq.jpg',
      createdAt: '2023-08-22',
    },
    {
      id: 'server-3',
      name: 'Digital Artists',
      description: 'Connect with digital artists, get feedback on your work, and discover new techniques and tools.',
      category: 'Art',
      rating: 8.9,
      memberCount: 1372,
      activeMembers: 210,
      imageUrl: 'https://utfs.io/f/ae34682c-5a6c-4320-92ca-681cd4d93376-plqwlq.jpg',
      createdAt: '2023-10-05',
    },
    {
      id: 'server-4',
      name: 'Study Group',
      description: 'A collaborative learning environment for students to study together, share notes, and prepare for exams.',
      category: 'Education',
      rating: 9.3,
      memberCount: 918,
      activeMembers: 145,
      imageUrl: 'https://utfs.io/f/ae34682c-5a6c-4320-92ca-681cd4d93376-plqwlq.jpg',
      createdAt: '2023-11-12',
    },
    {
      id: 'server-5',
      name: 'Bookworms Club',
      description: 'A community for book lovers to discuss literature, recommend books, and join virtual book clubs.',
      category: 'Community',
      rating: 9.1,
      memberCount: 892,
      activeMembers: 178,
      imageUrl: 'https://utfs.io/f/ae34682c-5a6c-4320-92ca-681cd4d93376-plqwlq.jpg',
      createdAt: '2023-07-30',
    },
  ];
  
  // Additional servers 
  const additionalServers = [
    {
      id: 'server-6',
      name: 'Music Lovers',
      description: 'A server for music enthusiasts to share favorite songs, discuss albums, and discover new artists.',
      category: 'Community',
      rating: 8.7,
      memberCount: 1243,
      activeMembers: 156,
      imageUrl: 'https://utfs.io/f/ae34682c-5a6c-4320-92ca-681cd4d93376-plqwlq.jpg',
      createdAt: '2023-12-01',
    },
    {
      id: 'server-7',
      name: 'Startup Network',
      description: 'Connect with entrepreneurs, share resources, and discuss challenges and opportunities in the startup world.',
      category: 'Technology',
      rating: 9.1,
      memberCount: 1512,
      activeMembers: 289,
      imageUrl: 'https://utfs.io/f/ae34682c-5a6c-4320-92ca-681cd4d93376-plqwlq.jpg',
      createdAt: '2023-09-28',
    },
    {
      id: 'server-8',
      name: 'Language Exchange',
      description: 'Practice languages with native speakers, get feedback on your writing, and improve your language skills.',
      category: 'Education',
      rating: 9.3,
      memberCount: 1678,
      activeMembers: 312,
      imageUrl: 'https://utfs.io/f/ae34682c-5a6c-4320-92ca-681cd4d93376-plqwlq.jpg',
      createdAt: '2023-10-15',
    },
  ];
  
  // Return the combined data
  return [...baseServers, ...additionalServers];
}

interface ServerExplorerProps {
  onJoinServer?: (serverId: string) => void;
}

const ServerExplorer = ({ onJoinServer }: ServerExplorerProps) => {
  // Create fresh server data for this component
  const allServers = createServerData();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredServers, setFilteredServers] = useState(allServers);

  // Apply filters and sort
  useEffect(() => {
    let result = [...allServers];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        server => 
          server.name.toLowerCase().includes(query) || 
          server.description.toLowerCase().includes(query)
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'All Categories') {
      result = result.filter(server => server.category === selectedCategory);
    }
    
    // Sort servers
    result = result.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.memberCount - a.memberCount;
        case 'rating':
          return b.rating - a.rating;
        case 'active':
          return b.activeMembers - a.activeMembers;
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });
    
    setFilteredServers(result);
  }, [searchQuery, selectedCategory, sortBy, allServers]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
    setSortBy('popular');
  };

  return (
    <div className="w-full py-6 space-y-6">
      <h1 className="text-3xl font-bold">Explore Servers</h1>
      
      {/* Filters and Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search servers by name or description..." 
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((category) => (
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
      {(searchQuery || selectedCategory !== 'All Categories') && (
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Active filters:</span>
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <Badge variant="outline" className="flex items-center gap-1">
                Search: {searchQuery}
              </Badge>
            )}
            {selectedCategory !== 'All Categories' && (
              <Badge variant="outline" className="flex items-center gap-1">
                Category: {selectedCategory}
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
      <div className="text-sm text-muted-foreground">
        Showing {filteredServers.length} {filteredServers.length === 1 ? 'server' : 'servers'}
      </div>
      
      {/* Server displays */}
      {filteredServers.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-lg text-muted-foreground">No servers found matching your criteria.</p>
          <Button variant="link" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredServers.map((server) => (
            <ServerCard
              key={server.id}
              {...server}
              onJoinServer={() => onJoinServer?.(server.id)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredServers.map((server) => (
            <div 
              key={server.id} 
              className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg"
            >
              <div className="flex items-center gap-4 md:w-64">
                <div 
                  className="relative w-16 h-16 rounded-full overflow-hidden border-2"
                  style={{ 
                    borderColor: 
                      server.category === 'Gaming' ? '#7963d2' : 
                      server.category === 'Education' ? '#10a37f' : 
                      server.category === 'Technology' ? '#0095ff' : 
                      server.category === 'Art' ? '#ff4500' : 
                      server.category === 'Community' ? '#f8b400' : '#888888' 
                  }}
                >
                  <img
                    src={server.imageUrl}
                    alt={server.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{server.name}</h3>
                  <Badge variant="outline" className="text-xs mt-1">
                    {server.category}
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
                        className={i < Math.floor(server.rating / 2) ? "fill-yellow-400 text-yellow-400" : "text-zinc-300"}
                      />
                    ))}
                    <span className="text-xs ml-1">{server.rating.toFixed(1)}/10</span>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {server.memberCount}
                    </span>
                    <span>{server.activeMembers} active</span>
                    <span>Created: {server.createdAt}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {server.description}
                </p>
                <div className="flex justify-end">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onJoinServer?.(server.id)}
                  >
                    Join Server
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServerExplorer; 