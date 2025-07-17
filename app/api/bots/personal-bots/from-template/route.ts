import { db } from "@/lib/db/db";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const user = await currentUser();
        if (!user) return new NextResponse('Unauthorized', { status: 401 });

        const { botTemplateId } = await req.json();

        if (!botTemplateId) {
            return new NextResponse('Missing bot template ID', { status: 400 });
        }

        const botTemplate = await db.botTemplate.findUnique({
            where: { id: botTemplateId }
        });

        if (!botTemplate) {
            return new NextResponse('Bot template not found', { status: 404 });
        }

        const personalBot = await db.personalBot.create({
            data: {
                creatorId: user.id,
                name: botTemplate.botName,
                profileDescription: botTemplate.description,
                imageUrl: botTemplate.imageUrl,
                modelName: botTemplate.modelName || 'default-model',
                systemPrompt: botTemplate.systemPrompt || '',
            }
        });

        const newConversation = await db.personalBotConversation.create({
            data: {
                userId: user.id,
                botId: personalBot.id,
            }
        });

        return NextResponse.json(newConversation);

    } catch (error) {
        console.log("[FROM_TEMPLATE_POST]", error);
        return new NextResponse('Internal Personal Bot Creation Error', { status: 500 });
    }
} 