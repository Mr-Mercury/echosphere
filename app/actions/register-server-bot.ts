'use server';
import * as z from 'zod';
import { ServerBotSchema } from '@/schemas';
import { db } from '@/lib/db/db';
import { serverBotPromptBuilder } from '@/lib/utilities/prompts/systemPromptBuilder';
import { fetchUserApiKey } from '@/lib/utilities/data/fetching/userApiKey';
import { sanitizeInput } from '@/lib/utilities/safety/sanitize';
import { MemberRole } from '@prisma/client';
import { currentUser } from '@/lib/utilities/data/fetching/currentUser';

type ActionResult = {
    error?: string;
    success?: any;
}

export const registerServerBotAction = async (
    values: z.infer<typeof ServerBotSchema>, 
    homeServerId: string
): Promise<ActionResult> => {
    try {
        // Get the current user server-side
        const user = await currentUser();
        if (!user) {
            return { error: "Unauthorized" };
        }

        if (!homeServerId) {
            return { error: "Server ID is required" };
        }

        // Verify the user has permission to create bots in this server
        const serverMember = await db.member.findFirst({
            where: {
                serverId: homeServerId,
                userId: user.id,
                role: {
                    in: [MemberRole.ADMIN, MemberRole.MODERATOR]
                }
            }
        });

        if (!serverMember) {
            return { error: "You don't have permission to create bots in this server" };
        }

        const validatedFields = ServerBotSchema.safeParse(values);
        if (!validatedFields.success) {
            const errorMessages = validatedFields.error.errors.map(err => err.message).join(', ');
            return { error: `Validation failed: ${errorMessages}` };
        }

        const { 
            name, 
            profileDescription, 
            imageUrl, 
            model, 
            fullPromptControl, 
            chatFrequency,
            systemPrompt: rawSystemPrompt,
            ourApiKey
        } = validatedFields.data;

        const sanitizedName = sanitizeInput(name);
        const sanitizedDescription = sanitizeInput(profileDescription);
        const sanitizedSystemPrompt = sanitizeInput(rawSystemPrompt);
        
        let apiKey: { id: string | null, key: string | null } = {
            id: null,
            key: null
        };

        if (ourApiKey === false) {
            const fetchedKey = await fetchUserApiKey(user.id, model);
            if (!fetchedKey) {
                return { error: `No API key found for model: ${model}` };
            }
            apiKey = {
                id: fetchedKey.id,
                key: fetchedKey.key
            };
        }

        if (ourApiKey === true) {
            apiKey.id = 'our-api-key';
            apiKey.key = process.env.OPENAI_API_KEY ?? null;
            if (!apiKey.key) {
                return { error: `No API key found for model: ${model}` };
            }
        }

        let systemPrompt = rawSystemPrompt;

        if (!fullPromptControl) {
            try {
                systemPrompt = serverBotPromptBuilder(systemPrompt, name);
            } catch (error) {
                return { error: `Failed to build system prompt: ${error instanceof Error ? error.message : 'Unknown error'}` };
            }
        }

        const newBot = await db.user.create({
            data: {
                human: false,
                initialized: true,
                image: imageUrl,
                name: sanitizedName,
                username: sanitizedName,
                botConfig: {
                    create: {
                        botName: sanitizedName,
                        description: sanitizedDescription,
                        systemPrompt: sanitizedSystemPrompt,
                        modelName: model,
                        chatFrequency,
                        apiKeyId: apiKey.id,
                        homeServerId,
                    }
                },
                members: {
                    create: {
                        serverId: homeServerId,
                        role: MemberRole.ECHO
                    }
                }
            },
            include: {
                botConfig: true,
                members: true
            }
        });

        const config = await db.botConfiguration.findFirst({
            where: {
                botUserId: newBot.id
            }
        });

        if (config) {
            await fetch(`${process.env.NEXT_PUBLIC_MESSAGE_SERVER_URL}/bots/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    botConfig: config
                })
            })
        }

        return { success: config };

    } catch (error) {
        console.error('Server bot registration failed:', error);
        
        if (error instanceof z.ZodError) {
            return { error: 'Invalid input data format' };
        }

        if (error instanceof Error) {
            if (error.message.includes('Unique constraint')) {
                return { error: 'A bot with this name already exists' };
            }

            if (error.message.includes('Foreign key constraint')) {
                return { error: 'Invalid server or user reference' };
            }

            return { error: `Registration failed: ${error.message}` };
        }

        return { error: 'An unexpected error occurred during bot registration' };
    }
}