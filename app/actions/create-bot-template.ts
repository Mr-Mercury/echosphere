'use server';
import * as z from 'zod';
import { BotTemplateSchema } from '@/zod-schemas';
import { db } from '@/lib/db/db';
import { serverBotPromptBuilder } from '@/lib/utilities/prompts/systemPromptBuilder';
import { sanitizeInput } from '@/lib/utilities/safety/sanitize';
import { currentUser } from '@/lib/utilities/data/fetching/currentUser';
import { ChatFrequencyMsgPerMinute } from "@/lib/config/chat-variables";

type ActionResult = {
    error?: string;
    success?: any;
}

export const registerBotTemplateAction = async (
    values: z.infer<typeof BotTemplateSchema>
): Promise<ActionResult> => {
    try {
        // Get the current user server-side
        const user = await currentUser();
        if (!user) {
            return { error: "Unauthorized" };
        }

        const validatedFields = BotTemplateSchema.safeParse(values);
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
        } = validatedFields.data;

        const sanitizedName = sanitizeInput(name);
        const sanitizedDescription = sanitizeInput(profileDescription);
        const sanitizedSystemPrompt = sanitizeInput(rawSystemPrompt);

        // Always save the original prompt
        const originalPrompt = sanitizedSystemPrompt;
        
        // Determine the system prompt based on fullPromptControl
        let systemPrompt = sanitizedSystemPrompt;
        if (!fullPromptControl) {
            try {
                systemPrompt = serverBotPromptBuilder(sanitizedSystemPrompt, sanitizedName);
            } catch (error) {
                return { error: `Failed to build system prompt: ${error instanceof Error ? error.message : 'Unknown error'}` };
            }
        }

        const existingBot = await db.botTemplate.findFirst({
            where: {
                botName: sanitizedName,
            }
        });

        if (existingBot) {
            return { error: `A template with the name "${sanitizedName}" already exists!` };
        }

        const newTemplate = await db.botTemplate.create({
            data: {
                botName: sanitizedName,
                imageUrl,
                description: sanitizedDescription,
                systemPrompt: systemPrompt,
                modelName: model,
                chatFrequency,
                messagesPerMinute: ChatFrequencyMsgPerMinute[chatFrequency as keyof typeof ChatFrequencyMsgPerMinute],
                prompt: originalPrompt, // Always store the original prompt
                creatorId: user.id,
            }
        });

        return { success: newTemplate };

    } catch (error) {
        console.error('Bot Template creation failed:', error);
        
        if (error instanceof z.ZodError) {
            return { error: 'Invalid input data format' };
        }

        if (error instanceof Error) {
            if (error.message.includes('Unique constraint')) {
                if (error.message.includes('botName')) {
                    return { error: 'A template with this name already exists' };
                }
                return { error: 'A template with this name already exists' };
            }

            if (error.message.includes('Unique constraint')) {
                return { error: 'A template with this name already exists' };
            }
            return { error: `Registration failed: ${error.message}` };
        }

        return { error: 'An unexpected error occurred during bot registration' };
    }
}