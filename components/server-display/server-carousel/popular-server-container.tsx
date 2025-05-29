import ServerCarousel from './server-carousel';
import { SAMPLE_SERVERS } from '@/lib/entities/server-display-types';
import { fetchPopularServerTemplatesWithRevalidation } from '@/lib/utilities/data/fetching/serverTemplates';

interface PopularServersContainerProps {
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
export default async function PopularServersContainer({ 
  title, 
  onViewAll,
  showTitle = true 
}: PopularServersContainerProps) {
  try {
    console.log("Fetching popular servers with time-based revalidation");
    
    // Use the time-based revalidation cached function
    const transformedServers = await fetchPopularServerTemplatesWithRevalidation();
    
    console.log(`Rendering BotCarousel with ${transformedServers.length} servers`);
    
    // Pass the fetched data to the client component
    return <ServerCarousel title={title} servers={transformedServers} onViewAll={onViewAll} showTitle={showTitle} />;
  } catch (error) {
    console.error("Failed to fetch popular bots:", error);
    
    // TypeScript-safe error logging
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
    
    console.log("Falling back to sample bots");
    // Fallback to sample bots in case of error
    return <ServerCarousel title={title} servers={SAMPLE_SERVERS} onViewAll={onViewAll} showTitle={showTitle} />;
  }
}