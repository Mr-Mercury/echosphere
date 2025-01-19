'use server';
import * as z from 'zod';
import { ServerBotSchema } from '@/schemas';
import { db } from '@/lib/db/db';
import { serverBotPromptBuilder } from '@/lib/utilities/prompts/systemPromptBuilder';
import { fetchUserApiKey } from '@/lib/utilities/data/fetching/userApiKey';


//Remember type safety in case backend is accessed directly somehow

export const registerAction = async (values: z.infer<typeof ServerBotSchema>, userId: string) => {
    try {
        const validatedFields = ServerBotSchema.safeParse(values)

        if (!validatedFields.success) {
            return { error: "Invalid fields!"}
        }

        const { name, profileDescription, imageUrl, model, fullPromptControl, chatFrequency } = validatedFields.data;

        const apiKey = await fetchUserApiKey(userId, model);

        let systemPrompt: string = validatedFields.data.systemPrompt;

        if (!fullPromptControl) {
            systemPrompt = serverBotPromptBuilder(systemPrompt, name)
        }

        const newBot = await db.user.create({
            data: {
                human: false,
                initialized: true,
                image: imageUrl,

                botConfig: {
                    create: {
                        botName: name,
                        description: profileDescription,
                        systemPrompt,
                        modelName: model,
                        chatFrequency,
                        apiKey,
                    }
                }
            }
        });
        return { success: newBot };
    } catch (error) {
        console.error("Error in registering server bot:", error);
        return { error: "Failed to register server bot" };
    }
}