'use client';

import React from 'react';
import ServerCard from '@/components/server-display/server-card/server-card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CATEGORY_COLORS } from "@/lib/config/categories";

// Sample data for demonstration - this would come from a real API in production

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