// Shared types for bot-related components

export interface Bot {
  id: string;
  name: string;
  description: string;
  prompt: string;
  copiesCreated: number;
  model: string;
  imageUrl: string;
  createdAt: string;
  rating?: number;
  creator?: {
    name: string | null;
    image: string | null;
  };
}

// Sample bots for development/fallback purposes
export const SAMPLE_BOTS: Bot[] = [
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