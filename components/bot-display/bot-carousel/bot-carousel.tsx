'use client';

import React from 'react';
import BotCard from '@/components/bot-display/bot-card/bot-card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Sample data for demonstration - this would come from a real API in production
export const SAMPLE_BOTS = [
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

interface BotCarouselProps {
  title: string;
  bots?: typeof SAMPLE_BOTS;
  onViewAll?: () => void;
  onCreateCopy?: (botId: string) => void;
}

const BotCarousel = ({
  title = 'Popular Bots',
  bots = SAMPLE_BOTS,
  onViewAll,
  onCreateCopy
}: BotCarouselProps) => {
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
          {bots.map((bot) => (
            <div key={bot.id} className="flex-shrink-0">
              <BotCard
                {...bot}
                onCreateCopy={() => onCreateCopy?.(bot.id)}
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

export default BotCarousel; 