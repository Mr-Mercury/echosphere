import { fetchBotTemplatesWithFiltersCached } from '@/lib/utilities/data/fetching/botTemplates';
import BotExplorer from './bot-explorer';
import { Bot } from '@/lib/entities/bot-display-types';

interface BotExplorerContainerProps {
  initialPage?: number;
  pageSize?: number;
  defaultSort?: 'popular' | 'rating' | 'recent';
  defaultModel?: string;
  searchQuery?: string;
}

// Server component that fetches initial data
export default async function BotExplorerContainer({
  initialPage = 1,
  pageSize = 20,
  defaultSort = 'popular',
  defaultModel = 'All Models',
  searchQuery = ''
}: BotExplorerContainerProps) {
  try {
    // Fetch initial data using the cached function
    const initialData = await fetchBotTemplatesWithFiltersCached({
      page: initialPage,
      pageSize,
      sort: defaultSort,
      model: defaultModel,
      searchQuery
    });

    return (
      <BotExplorer 
        initialData={initialData.bots}
        totalBots={initialData.total}
        defaultSort={defaultSort}
        defaultModel={defaultModel}
        defaultSearchQuery={searchQuery}
      />
    );
  } catch (error) {
    console.error('Failed to fetch initial bot data:', error);
    
    // Return empty state if data fetching fails
    return (
      <BotExplorer 
        initialData={[]}
        totalBots={0}
        defaultSort={defaultSort}
        defaultModel={defaultModel}
        defaultSearchQuery={searchQuery}
      />
    );
  }
}
