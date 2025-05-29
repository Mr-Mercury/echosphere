import { NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { Bot } from '@/lib/entities/bot-display-types';
import { getModelDisplayName } from '@/lib/utilities/data/fetching/botTemplates'; // Assuming this helper is accessible and needed

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { ids } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'Invalid or empty IDs array provided' }, { status: 400 });
        }

        const botTemplates = await db.botTemplate.findMany({
            where: {
                id: { in: ids },
            },
            include: {
                creator: {
                    select: {
                        name: true,
                        image: true,
                    },
                },
            },
        });

        const transformedBots: Bot[] = botTemplates.map(bot => ({
            id: bot.id,
            name: bot.botName,
            description: bot.description || '',
            prompt: bot.prompt || '',
            rating: bot.likes > 0 ? (bot.likes / (bot.likes + bot.dislikes || 1)) * 10 : 0, // Ensure this logic matches other places if needed
            copiesCreated: bot.copiesCreated,
            model: getModelDisplayName(bot.modelName || 'Unknown'),
            imageUrl: bot.imageUrl || '',
            createdAt: bot.createdAt.toISOString(),
            creator: bot.creator // This will be { name: string | null, image: string | null } | null
        }));

        return NextResponse.json(transformedBots);

    } catch (error) {
        console.error('Error in /api/templates/bots/by-ids:', error); // Updated error log path
        let errorMessage = 'Failed to fetch bot templates by IDs';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
} 