import { db } from '@/lib/db/db';
import { Bot } from '@/lib/entities/bot-display-types';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { CACHE_CONSTANTS } from '@/lib/config/cache-constants';
import { AVAILABLE_MODELS, PROVIDER_COLORS } from '@/lib/config/models';

/**
 * Calculate a popularity score based on copies created and like/dislike ratio
 */
export function calculatePopularityScore(copiesCreated: number, likes: number, dislikes: number) {
  const totalVotes = likes + dislikes || 1;
  const likeRatio = likes / totalVotes;
  
  // 70% weight to raw usage, 30% weight to rating-adjusted usage
  return (copiesCreated * 0.7) + (likeRatio * copiesCreated * 0.3);
}

/**
 * Map model IDs to display names based on the AVAILABLE_MODELS config
 * Returns a standardized display name that matches what's expected in the UI
 */
function getModelDisplayName(modelId: string): string {
  // Check if this is a model we know about
  if (modelId in AVAILABLE_MODELS) {
    const model = AVAILABLE_MODELS[modelId];
    
    // Use the actual model name from the configuration
    return model.name;
  }
  
  // Handle legacy models or models not in the config
  const modelLower = modelId.toLowerCase();
  if (modelLower.includes('claude')) return 'Claude';
  if (modelLower.includes('gpt-4o')) return 'GPT-4o';
  if (modelLower.includes('gpt-4')) return 'GPT-4';
  if (modelLower.includes('gpt')) return 'GPT';
  if (modelLower.includes('mistral')) return 'Mistral';
  if (modelLower.includes('llama')) return 'Llama';
  
  // Fallback to the original
  return modelId;
}

/**
 * Core implementation of popular bot templates fetching logic
 * Extracted as a separate function to be wrapped with different caching strategies
 */
async function fetchPopularBotTemplatesImpl(): Promise<Bot[]> {
  // First, check if we have any active bots with copies
  const activeBotCount = await db.botTemplate.count({
    where: {
      copiesCreated: {
        gt: 0
      }
    }
  });
  
  let botTemplates;

  if (activeBotCount >= 10) {
    // Normal case: We have enough active bots
    botTemplates = await db.botTemplate.findMany({
      where: {
        copiesCreated: {
          gt: 0
        }
      },
      orderBy: [
        { copiesCreated: 'desc' }
      ],
      take: 100,
      include: {
        creator: {
          select: {
            name: true,
            image: true
          }
        }
      }
    });
  } else {
    // Launch phase: Not enough bots with copies yet
    // Fall back to most recent bots or a mix of criteria
    botTemplates = await db.botTemplate.findMany({
      orderBy: [
        // First by copies (if any)
        { copiesCreated: 'desc' },
        // Then by creation date (newest first)
        { createdAt: 'desc' }
      ],
      take: 100,
      include: {
        creator: {
          select: {
            name: true,
            image: true
          }
        }
      }
    });
  }

  // For launch phase, adjust the score calculation to consider recency
  const scoredBots = botTemplates.map(bot => {
    // If we're in launch phase (few bots with copies), include recency in score
    if (activeBotCount < 10) {
      const daysSinceCreation = Math.max(1, Math.floor((Date.now() - bot.createdAt.getTime()) / (1000 * 60 * 60 * 24)));
      const recencyBoost = 100 / daysSinceCreation; // Higher for newer bots
      return {
        bot,
        score: calculatePopularityScore(bot.copiesCreated, bot.likes, bot.dislikes) + recencyBoost
      };
    }
    
    // Normal scoring for established product
    return {
      bot,
      score: calculatePopularityScore(bot.copiesCreated, bot.likes, bot.dislikes)
    };
  });

  // Sort by score descending and take top 10
  const topBots = scoredBots
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(({ bot }) => bot);
  
  // Transform to match the expected format for BotCard
  const transformedBots: Bot[] = topBots.map(bot => ({
    id: bot.id,
    name: bot.botName,
    description: bot.description || '',
    prompt: bot.prompt || '',
    rating: bot.likes > 0 ? (bot.likes / (bot.likes + bot.dislikes || 1)) * 10 : 0,
    copiesCreated: bot.copiesCreated,
    model: getModelDisplayName(bot.modelName || 'Unknown'),
    imageUrl: bot.imageUrl || '',
    createdAt: bot.createdAt.toISOString(),
    creator: bot.creator
  }));

  return transformedBots;
}

/**
 * Fetch popular bot templates from the database
 * Uses a combination of copies created, likes/dislikes, and recency
 * to determine popularity
 */
export const fetchPopularBotTemplates = async (): Promise<Bot[]> => {
  try {
    return await fetchPopularBotTemplatesImpl();
  } catch (error) {
    console.error('Error fetching popular bot templates:', error);
    throw new Error(`Failed to fetch popular bot templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Cached version using React's cache function for request deduplication
 * This maintains a cache for the lifetime of the server and automatically 
 * deduplicates requests with the same key across renders
 */
export const fetchPopularBotTemplatesCached = cache(fetchPopularBotTemplates);

/**
 * Time-based cached version of fetchPopularBotTemplates
 * Uses Next.js unstable_cache with revalidation period from CACHE_CONSTANTS
 * 
 * This caching strategy provides both:
 * 1. Automatic request deduplication within the same render pass
 * 2. Time-based cache revalidation after CACHE_CONSTANTS.POPULAR_BOTS seconds
 */
export const fetchPopularBotTemplatesWithRevalidation = unstable_cache(
  async () => {
    console.log('Popular bots cache revalidated');
    return await fetchPopularBotTemplates();
  },
  ['popular-bot-templates'],
  { revalidate: CACHE_CONSTANTS.POPULAR_BOTS }
);

/**
 * Interface for bot template fetch parameters
 */
interface FetchBotTemplatesParams {
  page: number;
  pageSize: number;
  sort?: 'popular' | 'rating' | 'recent';
  model?: string;
  searchQuery?: string;
}

/**
 * Fetch bot templates with filtering, sorting, and pagination
 */
export async function fetchBotTemplatesWithFilters({
  page,
  pageSize,
  sort = 'popular',
  model,
  searchQuery
}: FetchBotTemplatesParams): Promise<{ bots: Bot[], total: number }> {
  try {
    // Building the where clause for filtering
    const where: any = {};
    
    // model filter with support for model families
    if (model && model !== 'All Models') {
      // Handle specific model families
      if (model === 'GPT') {
        where.modelName = {
          contains: 'gpt',
          mode: 'insensitive'
        };
      } else if (model === 'Claude') {
        where.modelName = {
          contains: 'claude',
          mode: 'insensitive'
        };
      } else if (model === 'Mistral') {
        where.modelName = {
          contains: 'mistral',
          mode: 'insensitive'
        };
      } else if (model === 'Llama') {
        where.modelName = {
          contains: 'llama',
          mode: 'insensitive'
        };
      } else {
        // For specific model versions, match exactly
        where.modelName = model;
      }
    }
    
    // search query
    if (searchQuery) {
      where.OR = [
        { botName: { contains: searchQuery, mode: 'insensitive' } },
        { description: { contains: searchQuery, mode: 'insensitive' } },
        { prompt: { contains: searchQuery, mode: 'insensitive' } }
      ];
    }

    // pagination
    const skip = (page - 1) * pageSize;

    // Build the orderBy clause based on sort parameter
    let orderBy: any = {};
    switch (sort) {
      case 'popular':
        orderBy = { copiesCreated: 'desc' };
        break;
      case 'rating':
        // Calculate rating based on likes/dislikes ratio
        orderBy = [
          { likes: 'desc' },
          { dislikes: 'asc' }
        ];
        break;
      case 'recent':
        orderBy = { createdAt: 'desc' };
        break;
    }

    // Fetch the data
    const [bots, total] = await Promise.all([
      db.botTemplate.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          creator: {
            select: {
              name: true,
              image: true
            }
          }
        }
      }),
      db.botTemplate.count({ where })
    ]);

    // Transform the data to match Bot display type
    const transformedBots: Bot[] = bots.map(bot => ({
      id: bot.id,
      name: bot.botName,
      description: bot.description || '',
      prompt: bot.prompt || '',
      rating: bot.likes > 0 ? (bot.likes / (bot.likes + bot.dislikes || 1)) * 10 : 0,
      copiesCreated: bot.copiesCreated,
      model: getModelDisplayName(bot.modelName || 'Unknown'),
      imageUrl: bot.imageUrl || '',
      createdAt: bot.createdAt.toISOString(),
      creator: bot.creator
    }));

    return {
      bots: transformedBots,
      total
    };
  } catch (error) {
    console.error('Error fetching bot templates:', error);
    throw new Error(`Failed to fetch bot templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Cached version of fetchBotTemplatesWithFilters using Next.js unstable_cache
 * Cache duration is shorter than popular bots 
 */
export const fetchBotTemplatesWithFiltersCached = unstable_cache(
  async (params: FetchBotTemplatesParams) => {
    console.log('Bot templates cache revalidated');
    return await fetchBotTemplatesWithFilters(params);
  },
  ['bot-templates-filtered'],
  { revalidate: CACHE_CONSTANTS.BOT_TEMPLATES }
); 