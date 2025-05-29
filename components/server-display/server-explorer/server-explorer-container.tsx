import { fetchServerTemplatesWithFiltersCached } from '@/lib/utilities/data/fetching/serverTemplates';
import ServerExplorer from './server-explorer';
import { Server } from '@/lib/entities/server-display-types';
import { SERVER_EXPLORER_DEFAULTS, SERVER_PAGINATION } from '@/lib/config/server-explorer'; // Assuming this will be created

interface ServerExplorerContainerProps {
  initialPage?: number;
  pageSize?: number;
  defaultSort?: 'popular' | 'recent' | 'name';
  defaultCategory?: string;
  searchQuery?: string;
  currentUserId?: string;
}

// Server component that fetches initial data
export default async function ServerExplorerContainer({
  initialPage = 1,
  pageSize = SERVER_PAGINATION.PAGE_SIZE, // Use a constant for page size
  defaultSort = SERVER_EXPLORER_DEFAULTS.SORT as 'popular' | 'recent' | 'name',
  defaultCategory = SERVER_EXPLORER_DEFAULTS.CATEGORY,
  searchQuery = '',
  currentUserId,
}: ServerExplorerContainerProps) {
  try {
    const initialData = await fetchServerTemplatesWithFiltersCached({
      page: initialPage,
      pageSize,
      sort: defaultSort,
      category: defaultCategory,
      searchQuery,
      creatorId: undefined, // Explicitly not filtering by creatorId for initial load of "All Templates"
      isPublic: true, // Default to public templates
    });

    return (
      <ServerExplorer 
        initialServers={initialData.servers}
        totalServers={initialData.total}
        defaultSort={defaultSort}
        defaultCategory={defaultCategory}
        defaultSearchQuery={searchQuery}
        currentUserId={currentUserId}
        pageSize={pageSize}
      />
    );
  } catch (error) {
    console.error('Failed to fetch initial server template data:', error);
    return (
      <ServerExplorer 
        initialServers={[]}
        totalServers={0}
        defaultSort={defaultSort}
        defaultCategory={defaultCategory}
        defaultSearchQuery={searchQuery}
        currentUserId={currentUserId}
        pageSize={pageSize}
      />
    );
  }
}
