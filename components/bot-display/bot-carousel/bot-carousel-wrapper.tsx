import BotCarousel from './bot-carousel';
import { db } from '@/lib/db/db';
import { Bot, SAMPLE_BOTS } from '@/components/bot-display/types';

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
    console.log("Fetching popular bots directly from database");
    
    // First, check if we have any active bots with copies
    const activeBotCount = await db.botTemplate.count({
      where: {
        copiesCreated: {
          gt: 0
        }
      }
    });
    
    console.log(`Found ${activeBotCount} bots with copies`);

    let botTemplates;

    if (activeBotCount >= 10) {
      console.log("Using normal case (enough active bots)");
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
      console.log("Using launch phase (few or no active bots)");
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
    
    console.log(`Retrieved ${botTemplates.length} bot templates`);

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
      
    console.log(`Selected top ${topBots.length} bots`);

    // Transform to match the expected format for BotCard
    const transformedBots: Bot[] = topBots.map(bot => ({
      id: bot.id,
      name: bot.botName,
      description: bot.description || '',
      prompt: bot.prompt || '',
      rating: bot.likes > 0 ? (bot.likes / (bot.likes + bot.dislikes || 1)) * 10 : 0,
      copiesCreated: bot.copiesCreated,
      model: bot.modelName || 'Unknown',
      imageUrl: bot.imageUrl || '',
      createdAt: bot.createdAt.toISOString(),
      creator: bot.creator
    }));
    
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