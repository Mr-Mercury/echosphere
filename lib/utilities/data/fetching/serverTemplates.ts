import { db } from '@/lib/db/db';
import { Server, ChannelPreview, BotPreview } from '@/lib/entities/server-display-types';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { CACHE_CONSTANTS } from '@/lib/config/cache-constants';

// Helper function to safely parse channels JSON
function parseChannelsPreview(json: any): ChannelPreview[] {
  let parsedJson: any;
  if (typeof json === 'string') {
    try {
      parsedJson = JSON.parse(json);
    } catch (e) {
      console.error("Failed to parse channels JSON string:", e);
      return [];
    }
  } else {
    parsedJson = json;
  }

  if (Array.isArray(parsedJson)) {
    return parsedJson.filter(
      (item: any): item is ChannelPreview =>
        item &&
        typeof item.name === 'string' &&
        (item.type === 'TEXT' || item.type === 'AUDIO') &&
        (item.topic === undefined || item.topic === null || typeof item.topic === 'string')
    );
  }
  return [];
}

// Helper function to safely parse tags JSON
function parseTags(json: any): string[] {
  if (json === null || json === undefined) return [];
  let parsedJson: any;
  if (typeof json === 'string') {
    try {
      parsedJson = JSON.parse(json);
    } catch (e) {
      console.error("Failed to parse tags JSON string:", e);
      return [];
    }
  } else {
    parsedJson = json;
  }

  if (Array.isArray(parsedJson)) {
    return parsedJson.filter((item: any): item is string => typeof item === 'string');
  }
  return [];
}

// Calculate a popularity score based on usage count and potentially recency
// MODIFIED: Adapted for ServerTemplate which uses usageCount (analogous to copiesCreated)
// ServerTemplate does not have likes/dislikes in the Prisma schema provided.
export function calculateServerPopularityScore(usageCount: number) {
  // For now, score is directly based on usageCount. Can be expanded later.
  return usageCount;
}

// Core implementation of popular server templates fetching logic
async function fetchPopularServerTemplatesImpl(): Promise<Server[]> {
  const activeServerCount = await db.serverTemplate.count({
    where: {
      usageCount: {
        gt: 0,
      },
      isPublic: true, // Assuming popular templates should be public
    },
  });

  let serverTemplatesData;

  if (activeServerCount >= 10) {
    serverTemplatesData = await db.serverTemplate.findMany({
      where: {
        usageCount: {
          gt: 0,
        },
        isPublic: true,
      },
      orderBy: [{ usageCount: 'desc' }],
      take: 100, // Fetch more and then score/sort
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        botTemplates: { // Include for BotPreview
          select: {
            id: true,
            botName: true,
            imageUrl: true,
          }
        }
      },
    });
  } else {
    // Launch phase: Not enough server templates with usage yet
    serverTemplatesData = await db.serverTemplate.findMany({
      where: {
        isPublic: true,
      },
      orderBy: [{ usageCount: 'desc' }, { createdAt: 'desc' }],
      take: 100,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        botTemplates: {
           select: {
            id: true,
            botName: true,
            imageUrl: true,
          }
        }
      },
    });
  }

  const scoredServerTemplates = serverTemplatesData.map(st => {
    let score = calculateServerPopularityScore(st.usageCount);
    if (activeServerCount < 10) {
      const daysSinceCreation = Math.max(1, Math.floor((Date.now() - st.createdAt.getTime()) / (1000 * 60 * 60 * 24)));
      const recencyBoost = 50 / daysSinceCreation; // Smaller boost than bots, adjust as needed
      score += recencyBoost;
    }
    return {
      serverTemplate: st,
      score,
    };
  });

  const topServerTemplates = scoredServerTemplates
    .sort((a, b) => b.score - a.score)
    .slice(0, 10) // Take top 10 after scoring
    .map(({ serverTemplate }) => serverTemplate);

  // Transform to match the expected format for ServerCard
  const transformedServers: Server[] = topServerTemplates.map(st => ({
    id: st.id,
    name: st.serverName,
    description: st.description || '',
    category: st.category || 'General', // Default category
    rating: undefined, // ServerTemplate doesn't have explicit rating fields like likes/dislikes
    imageUrl: st.serverImageUrl || '',
    createdAt: st.createdAt.toISOString(),
    memberCount: undefined, // Not directly available on ServerTemplate
    activeMembers: undefined, // Not directly available on ServerTemplate
    creator: st.creator ? { id: st.creator.id, name: st.creator.name, username: st.creator.username, image: st.creator.image } : undefined,
    tags: parseTags(st.tags),
    isPublic: st.isPublic,
    usageCount: st.usageCount,
    channelsPreview: parseChannelsPreview(st.channels),
    botTemplatesPreview: st.botTemplates.map(bt => ({
      id: bt.id,
      name: bt.botName,
      imageUrl: bt.imageUrl
    })) as BotPreview[],
  }));

  return transformedServers;
}

/**
 * Fetch popular server templates from the database
 * MODIFIED: Renamed and adapted for ServerTemplates
 */
export const fetchPopularServerTemplates = async (): Promise<Server[]> => {
  try {
    return await fetchPopularServerTemplatesImpl();
  } catch (error) {
    console.error('Error fetching popular server templates:', error);
    throw new Error(`Failed to fetch popular server templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Cached version using React's cache function for request deduplication
 * MODIFIED: Renamed for ServerTemplates
 */
export const fetchPopularServerTemplatesCached = cache(fetchPopularServerTemplates);

/**
 * Time-based cached version of fetchPopularServerTemplates
 * Uses Next.js unstable_cache with revalidation period from CACHE_CONSTANTS
 * MODIFIED: Renamed, updated cache key and constant for ServerTemplates
 */
export const fetchPopularServerTemplatesWithRevalidation = unstable_cache(
  async () => {
    console.log('Popular server templates cache revalidated');
    return await fetchPopularServerTemplates();
  },
  ['popular-server-templates'], // MODIFIED: Cache key
  { revalidate: CACHE_CONSTANTS.POPULAR_SERVERS || CACHE_CONSTANTS.POPULAR_BOTS } // Use POPULAR_SERVERS or fallback
);

/**
 * Interface for server template fetch parameters
 */
interface FetchServerTemplatesParams {
  page: number;
  pageSize: number;
  sort?: 'popular' | 'recent' | 'name'; // MODIFIED: Sort options
  category?: string; // MODIFIED: Filter by category
  searchQuery?: string;
  creatorId?: string;
  isPublic?: boolean;
}

// Fetch server templates with filtering, sorting, and pagination
export async function fetchServerTemplatesWithFilters({
  page,
  pageSize,
  sort = 'popular',
  category,
  searchQuery,
  creatorId,
  isPublic = true, // Default to fetching public templates
}: FetchServerTemplatesParams): Promise<{ servers: Server[], total: number }> {
  try {
    const where: any = { isPublic }; // Initialize with isPublic

    if (creatorId) {
      where.creatorId = creatorId;
    }

    if (category && category !== 'All Categories') { // Assuming 'All Categories' means no filter
      where.category = category;
    }

    if (searchQuery) {
      where.OR = [
        { serverName: { contains: searchQuery, mode: 'insensitive' } }, // Added mode for case-insensitivity if supported by DB
        { description: { contains: searchQuery, mode: 'insensitive' } },
        // Note: Searching tags might require specific JSON handling depending on DB (e.g., `array_contains` for PostgreSQL)
        // For simplicity, sticking to name and description.
      ];
    }
    
    const skip = (page - 1) * pageSize;

    let orderBy: any = {};
    switch (sort) {
      case 'popular':
        orderBy = { usageCount: 'desc' };
        break;
      case 'recent':
        orderBy = { createdAt: 'desc' };
        break;
      case 'name':
        orderBy = { serverName: 'asc' };
        break;
    }

    const [serverTemplatesData, total] = await Promise.all([
      db.serverTemplate.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
          botTemplates: {
             select: {
               id: true,
               botName: true,
               imageUrl: true,
             }
          }
        },
      }),
      db.serverTemplate.count({ where }),
    ]);

    const transformedServers: Server[] = serverTemplatesData.map(st => ({
      id: st.id,
      name: st.serverName,
      description: st.description || '',
      category: st.category || 'General',
      rating: undefined,
      imageUrl: st.serverImageUrl || '',
      createdAt: st.createdAt.toISOString(),
      memberCount: undefined,
      activeMembers: undefined,
      creator: st.creator ? { id: st.creator.id, name: st.creator.name, username: st.creator.username, image: st.creator.image } : undefined,
      tags: parseTags(st.tags),
      isPublic: st.isPublic,
      usageCount: st.usageCount,
      channelsPreview: parseChannelsPreview(st.channels),
      botTemplatesPreview: st.botTemplates.map(bt => ({
        id: bt.id,
        name: bt.botName,
        imageUrl: bt.imageUrl
      })) as BotPreview[],
    }));

    return {
      servers: transformedServers,
      total,
    };
  } catch (error) {
    console.error('Error fetching server templates with filters:', error);
    throw new Error(`Failed to fetch server templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Cached version of fetchServerTemplatesWithFilters using Next.js unstable_cache
export const fetchServerTemplatesWithFiltersCached = unstable_cache(
  async (params: FetchServerTemplatesParams) => {
    console.log('Server templates (filtered) cache revalidated for params:', params);
    return await fetchServerTemplatesWithFilters(params);
  },
  ['server-templates-filtered'], // MODIFIED: Cache key
  { revalidate: CACHE_CONSTANTS.SERVER_TEMPLATES || CACHE_CONSTANTS.BOT_TEMPLATES } // Use SERVER_TEMPLATES or fallback
); 