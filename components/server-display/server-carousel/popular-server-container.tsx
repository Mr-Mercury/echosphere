import ServerCarousel from './server-carousel';
import { SAMPLE_SERVERS, Server } from '@/lib/entities/server-display-types';
import { fetchPopularServerTemplatesWithRevalidation } from '@/lib/utilities/data/fetching/serverTemplates';

interface PopularServersContainerProps {
  title: string;
  onViewAll?: () => void;
  showTitle?: boolean;
}

// Server component that directly accesses the database
export default async function PopularServersContainer({ 
  title, 
  onViewAll,
  showTitle = true 
}: PopularServersContainerProps) {
  let transformedServers: Server[];
  try {
    console.log("Fetching popular servers with time-based revalidation");
    
    // Use the time-based revalidation cached function
    transformedServers = await fetchPopularServerTemplatesWithRevalidation();
    
    console.log(`Rendering ServerCarousel with ${transformedServers.length} servers`);
    
  } catch (error) {
    console.error("Failed to fetch popular servers:", error);
    
    // TypeScript-safe error logging
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
    
    console.log("Falling back to sample servers");
    // Fallback to sample servers in case of error
    transformedServers = SAMPLE_SERVERS as Server[];
  }
  // Pass the fetched data to the client component
  return <ServerCarousel title={title} servers={transformedServers} onViewAll={onViewAll} showTitle={showTitle} />;
}