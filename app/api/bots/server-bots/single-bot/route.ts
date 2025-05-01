import { db } from "@/lib/db/db";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
    try {
        const user = await currentUser();
        if (!user) return new NextResponse('Unauthorized', { status: 401 });

        const url = new URL(req.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return new NextResponse('Missing bot ID', { status: 400 });
        }

        const botConfig = await db.botConfiguration.findUnique({
            where: {
                botUserId: id
            },
            include: {
                botUser: true
            }
        });

        if (!botConfig) {
            return new NextResponse('Server bot not found', { status: 404 });
        }


        const parsedBody = await req.json();

        const { modelName, description, systemPrompt, chatFrequency, useSystemKey, messagesPerMinute, apiKeyId, image, botName} = parsedBody;

        // Update both botConfiguration and the corresponding botUser in a transaction
        const [updatedBotConfig, updatedBotUser] = await db.$transaction([
            db.botConfiguration.update({
                where: {
                    botUserId: id
                },
                data: {
                    modelName,
                    description,
                    systemPrompt,
                    chatFrequency,
                    useSystemKey,
                    messagesPerMinute,
                    apiKeyId,
                    botName
                }
            }),
            db.user.update({
                where: {
                    id: id
                },
                data: {
                    name: botName,
                    image: image
                }
            })
        ]);

        return NextResponse.json({
            botConfig: updatedBotConfig,
            botUser: updatedBotUser
        });        
    } catch (error) {
        console.log(error);
        return new NextResponse('Internal Server Bot Update Error', { status: 500 });
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
        
        // Get a specific server bot by ID
        const botConfig = await db.botConfiguration.findUnique({
            where: {
                botUserId: id
            },
            include: {
                botUser: true
            }
        });
        
        if (!botConfig) {
            return new NextResponse('Server bot not found', { status: 404 });
        }
        
        return NextResponse.json(botConfig);
    } catch (error) {
        console.log(error);
        return new NextResponse('Failed to fetch server bot data', { status: 500 });
    }
}