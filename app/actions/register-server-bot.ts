'use server';
import * as z from 'zod';
import { ServerBotSchema } from '@/schemas';
import { db } from '@/lib/db/db';
import { serverBotPromptBuilder } from '@/lib/utilities/prompts/systemPromptBuilder';


//Remember type safety in case backend is accessed directly somehow

export const registerAction = async (values: z.infer<typeof ServerBotSchema>, userId: string) => {
    const validatedFields = ServerBotSchema.safeParse(values)

    if (!validatedFields.success) {
        return { error: "Invalid fields!"}
    }

    const { name, profileDescription, imageUrl, model, fullPromptControl, chatFrequency } = validatedFields.data;

    const apiKey = await fetchUserApiKey(userId);

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

    return { success: newBot }
}