'use client';

import React from 'react';
import ServerCard from '@/components/server-display/server-card/server-card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CATEGORY_COLORS } from "@/lib/config/categories";

// Sample data for demonstration - this would come from a real API in production
export const SAMPLE_SERVERS = [
  {
    id: 'server-1',
    name: 'Movie Buffs',
    description: 'A community for movie enthusiasts to discuss their favorite films, share reviews, and discover new releases.',
    category: 'Movies',
    rating: 9.2,
    memberCount: 1587,
    activeMembers: 342,
    imageUrl: 'https://utfs.io/f/ae34682c-5a6c-4320-92ca-681cd4d93376-plqwlq.jpg',
    createdAt: '2023-09-15',
  },
  {
    id: 'server-2',
    name: 'TV Series Club',
    description: 'A server for TV show fans to discuss episodes, share theories, and keep up with the latest series.',
    category: 'TV',
    rating: 9.5,
    memberCount: 2104,
    activeMembers: 487,
    imageUrl: 'https://utfs.io/f/ae34682c-5a6c-4320-92ca-681cd4d93376-plqwlq.jpg',
    createdAt: '2023-08-22',
  },
  {
    id: 'server-3',
    name: 'Comic Book Universe',
    description: 'Connect with comic book fans, discuss storylines, and explore the world of graphic novels.',
    category: 'Comics',
    rating: 8.9,
    memberCount: 1372,
    activeMembers: 210,
    imageUrl: 'https://utfs.io/f/ae34682c-5a6c-4320-92ca-681cd4d93376-plqwlq.jpg',
    createdAt: '2023-10-05',
  },
  {
    id: 'server-4',
    name: 'Anime World',
    description: 'A community for anime fans to discuss their favorite shows, share recommendations, and explore Japanese animation.',
    category: 'Anime',
    rating: 9.3,
    memberCount: 918,
    activeMembers: 145,
    imageUrl: 'https://utfs.io/f/ae34682c-5a6c-4320-92ca-681cd4d93376-plqwlq.jpg',
    createdAt: '2023-11-12',
  },
  {
    id: 'server-5',
    name: 'News & Events',
    description: 'Stay updated with the latest news, discuss current events, and engage in meaningful conversations.',
    category: 'Current Events',
    rating: 9.1,
    memberCount: 892,
    activeMembers: 178,
    imageUrl: 'https://utfs.io/f/ae34682c-5a6c-4320-92ca-681cd4d93376-plqwlq.jpg',
    createdAt: '2023-07-30',
  },
];

interface ServerCarouselProps {
  title: string;
  servers?: typeof SAMPLE_SERVERS;
  onViewAll?: () => void;
  onJoinServer?: (serverId: string) => void;
}

const ServerCarousel = ({
  title = 'Popular Servers',
  servers = SAMPLE_SERVERS,
  onViewAll,
  onJoinServer
}: ServerCarouselProps) => {
  const carouselRef = React.useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({
        left: 300,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full px-6 py-6">
      <div className="flex justify-center text-center items-center mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        {onViewAll && (
          <Button variant="link" onClick={onViewAll} className="absolute right-6">
            View all
          </Button>
        )}
      </div>
      
      <div className="relative px-8">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 rounded-full hover:bg-zinc-800/80 hover:ring-2 hover:ring-white/50 transition-all bg-background/50 backdrop-blur-sm"
          onClick={scrollLeft}
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </Button>
        
        <div 
          ref={carouselRef}
          className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {servers.map((server) => (
            <div key={server.id} className="flex-shrink-0">
              <ServerCard
                {...server}
                onJoinServer={() => onJoinServer?.(server.id)}
              />
            </div>
          ))}
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 rounded-full hover:bg-zinc-800/80 hover:ring-2 hover:ring-white/50 transition-all bg-background/50 backdrop-blur-sm"
          onClick={scrollRight}
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </Button>
      </div>
    </div>
  );
};

export default ServerCarousel; 