import { db } from "@/lib/db/db";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { NextResponse } from "next/server";
import { serverBotPromptBuilder } from '@/lib/utilities/prompts/systemPromptBuilder';
import { sanitizeInput } from '@/lib/utilities/safety/sanitize';

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

        const { 
            modelName, 
            description, 
            systemPrompt, 
            prompt: clientPrompt, // Renamed to distinguish from the calculated prompt
            chatFrequency, 
            useSystemKey, 
            messagesPerMinute, 
            apiKeyId, 
            image, 
            botName,
            fullPromptControl
        } = parsedBody;

        // Sanitize the system prompt
        const sanitizedSystemPrompt = sanitizeInput(systemPrompt);
        
        // Always preserve the original prompt in the prompt field
        // This gives us access to the user's original input when editing
        const originalPrompt = sanitizeInput(clientPrompt || systemPrompt);
        
        // Handle prompt field update logic based on fullPromptControl
        let updatedSystemPrompt = sanitizedSystemPrompt;

        if (!fullPromptControl) {
            // Generate the modified system prompt using the original input
            try {
                updatedSystemPrompt = serverBotPromptBuilder(sanitizedSystemPrompt, botName);
            } catch (error) {
                return new NextResponse(`Failed to build system prompt: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 400 });
            }
        }

        // Update both botConfiguration and the corresponding botUser in a transaction
        const [updatedBotConfig, updatedBotUser] = await db.$transaction([
            db.botConfiguration.update({
                where: {
                    botUserId: id
                },
                data: {
                    modelName,
                    description,
                    systemPrompt: updatedSystemPrompt,
                    prompt: originalPrompt, // Always store the original prompt
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
                    username: botName,
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
        
        // Determine if the bot is using full prompt control by checking the prompt field
        // If prompt exists, it means fullPromptControl was false when it was saved
        // If prompt is null/undefined, it means fullPromptControl was true
        const fullPromptControl = !botConfig.prompt;
        
        // Return the bot config with the derived fullPromptControl property
        return NextResponse.json({
            ...botConfig,
            fullPromptControl
        });
    } catch (error) {
        console.log(error);
        return new NextResponse('Failed to fetch server bot data', { status: 500 });
    }
}