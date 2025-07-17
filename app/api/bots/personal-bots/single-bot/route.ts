import { db } from "@/lib/db/db";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const user = await currentUser();
        if (!user) return new NextResponse('Unauthorized', { status: 401 });

        const { name, profileDescription, imageUrl, modelName, systemPrompt } = await req.json();

        if (!name || !modelName || !systemPrompt) {
            return new NextResponse('Missing required fields: name, modelName, systemPrompt', { status: 400 });
        }

        const personalBot = await db.personalBot.create({
            data: {
                creatorId: user.id,
                name,
                profileDescription,
                imageUrl,
                modelName,
                systemPrompt,
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
        console.log("[PERSONAL_BOT_POST]", error);
        return new NextResponse('Internal Personal Bot Creation Error', { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const user = await currentUser();
        if (!user) return new NextResponse('Unauthorized', { status: 401 });

        const url = new URL(req.url);
        const id = url.searchParams.get('id');
        const values = await req.json();

        if (!id) {
            return new NextResponse('Missing bot ID', { status: 400 });
        }

        const personalBot = await db.personalBot.update({
            where: {
                id,
                creatorId: user.id
            },
            data: {
                ...values,
            }
        });

        return NextResponse.json(personalBot);

    } catch (error) {
        console.log(error);
        return new NextResponse('Internal Personal Bot Update Error', { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const user = await currentUser();
        if (!user) return new NextResponse('Unauthorized', { status: 401 });

        const url = new URL(req.url);
        const id = url.searchParams.get('id');
        
        if (!id) {
            return new NextResponse('Missing bot ID', { status: 400 });
        }
        
        const personalBot = await db.personalBot.findUnique({
            where: {
                id,
                creatorId: user.id
            }
        });

        if (!personalBot) {
            return new NextResponse('Personal bot not found', { status: 404 });
        }

        return NextResponse.json(personalBot);
    } catch (error) {
        console.log(error);
        return new NextResponse('Failed to fetch personal bot data', { status: 500 });
    }
}