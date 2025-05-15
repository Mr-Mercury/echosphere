import BotCarousel from './bot-carousel';
import { SAMPLE_BOTS } from '@/lib/entities/bot-display-types';
import { fetchPopularBotTemplatesWithRevalidation } from '@/lib/utilities/data/fetching/botTemplates';

interface PopularBotsContainerProps {
  title: string;
  onViewAll?: () => void;
  showTitle?: boolean;
}

// Calculate a popularity score based on copies created and like/dislike ratio
function calculatePopularityScore(copiesCreated: number, likes: number, dislikes: number) {
  const totalVotes = likes + dislikes || 1;
  const likeRatio = likes / totalVotes;
  
  // 70% weight to raw usage, 30% weight to rating-adjusted usage
  return (copiesCreated * 0.7) + (likeRatio * copiesCreated * 0.3);
}

// Server component that directly accesses the database
export default async function PopularBotsContainer({ 
  title, 
  onViewAll,
  showTitle = true 
}: PopularBotsContainerProps) {
  try {
    console.log("Fetching popular bots with time-based revalidation");
    
    // Use the time-based revalidation cached function
    const transformedBots = await fetchPopularBotTemplatesWithRevalidation();
    
    console.log(`Rendering BotCarousel with ${transformedBots.length} bots`);
    
    // Pass the fetched data to the client component
    return <BotCarousel title={title} bots={transformedBots} onViewAll={onViewAll} showTitle={showTitle} />;
  } catch (error) {
    console.error("Failed to fetch popular bots:", error);
    
    // TypeScript-safe error logging
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
    
    console.log("Falling back to sample bots");
    // Fallback to sample bots in case of error
    return <BotCarousel title={title} bots={SAMPLE_BOTS} onViewAll={onViewAll} showTitle={showTitle} />;
  }
}