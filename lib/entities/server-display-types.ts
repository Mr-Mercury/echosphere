// Shared types for bot-related components

export interface ChannelPreview {
  name: string;
  type: "TEXT" | "AUDIO";
  topic?: string;
}

export interface BotPreview {
  id: string;
  name: string;
  imageUrl?: string | null;
}

export interface Server {
    id: string;
    name: string;
    description: string;
    category: string;
    rating?: number;
    imageUrl: string;
    createdAt: string;
    memberCount?: number;
    activeMembers?: number;

    creator?: {
      name: string | null;
      image: string | null;
    };
    tags?: string[];
    isPublic?: boolean;
    usageCount?: number;
    channelsPreview?: ChannelPreview[];
    botTemplatesPreview?: BotPreview[];
}
  
  // Sample bots for development/fallback purposes
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
  