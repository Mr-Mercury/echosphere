'use client';

import React from 'react';
import ServerCard from '@/components/server-display/server-card/server-card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Sample data for demonstration - this would come from a real API in production
export const SAMPLE_SERVERS = [
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
    <div className="w-full py-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        {onViewAll && (
          <Button variant="link" onClick={onViewAll}>
            View all
          </Button>
        )}
      </div>
      
      <div className="relative">
        <Button 
          variant="outline" 
          size="icon" 
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-md bg-background"
          onClick={scrollLeft}
        >
          <ChevronLeft className="h-4 w-4" />
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
          variant="outline" 
          size="icon" 
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-md bg-background"
          onClick={scrollRight}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ServerCarousel; 