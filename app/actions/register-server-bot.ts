'use server';
import * as z from 'zod';
import { ServerBotSchema } from '@/zod-schemas';
import { db } from '@/lib/db/db';
import { serverBotPromptBuilder } from '@/lib/utilities/prompts/systemPromptBuilder';
import { fetchUserApiKey } from '@/lib/utilities/data/fetching/userApiKey';
import { sanitizeInput } from '@/lib/utilities/safety/sanitize';
import { MemberRole } from '@prisma/client';
import { currentUser } from '@/lib/utilities/data/fetching/currentUser';
import { ChatFrequencyMsgPerMinute } from "@/lib/config/chat-variables";
import { generateUniqueUsername } from '@/lib/utilities/user-generation/generateUniqueUsername';

type ActionResult = {
    error?: string;
    success?: any;
}

export const registerServerBotAction = async (
    values: z.infer<typeof ServerBotSchema>, 
    homeServerId: string,
    templateId?: string
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
        
        // Generate unique username with sequential number
        const uniqueUsername = await generateUniqueUsername(sanitizedName);

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

        let systemPrompt = sanitizedSystemPrompt;
        let originalPrompt = null;

        if (!fullPromptControl) {
            try {
                // Save the original prompt before modifying it
                originalPrompt = sanitizedSystemPrompt;
                systemPrompt = serverBotPromptBuilder(systemPrompt, sanitizedName);
            } catch (error) {
                return { error: `Failed to build system prompt: ${error instanceof Error ? error.message : 'Unknown error'}` };
            }
        }

        const existingBot = await db.botConfiguration.findFirst({
            where: {
                botName: sanitizedName,
                homeServerId: homeServerId
            }
        });

        if (existingBot) {
            return { error: `A bot with the name "${sanitizedName}" already exists in this server` };
        }

        const newBot = await db.user.create({
            data: {
                human: false,
                initialized: true,
                image: imageUrl,
                name: sanitizedName,
                username: uniqueUsername,
                botConfig: {
                    create: {
                        botName: sanitizedName,
                        description: sanitizedDescription,
                        systemPrompt: systemPrompt,
                        modelName: model,
                        chatFrequency,
                        messagesPerMinute: ChatFrequencyMsgPerMinute[chatFrequency as keyof typeof ChatFrequencyMsgPerMinute],
                        apiKeyId: apiKey.id,
                        homeServerId,
                        prompt: originalPrompt,
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

        // If a templateId is provided, increment the copiesCreated count
        if (templateId) {
            try {
                await db.botTemplate.update({
                    where: { id: templateId },
                    data: {
                        copiesCreated: {
                            increment: 1
                        }
                    }
                });
            } catch (error) {
                // Log the error but don't let it fail the whole bot creation process
                console.error(`Failed to increment copiesCreated for template ${templateId}:`, error);
            }
        }

        return { success: config };

    } catch (error) {
        console.error('Server bot registration failed:', error);
        
        if (error instanceof z.ZodError) {
            return { error: 'Invalid input data format' };
        }

        if (error instanceof Error) {
            // Update error handling to catch the unique constraint violation
            if (error.message.includes('Unique constraint')) {
                // This catches both username uniqueness and the new botName+homeServerId constraint
                if (error.message.includes('botName')) {
                    return { error: 'A bot with this name already exists in this server' };
                }
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