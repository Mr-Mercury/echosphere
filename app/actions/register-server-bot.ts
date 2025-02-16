'use server';
import * as z from 'zod';
import { ServerBotSchema } from '@/schemas';
import { db } from '@/lib/db/db';
import { serverBotPromptBuilder } from '@/lib/utilities/prompts/systemPromptBuilder';
import { fetchUserApiKey } from '@/lib/utilities/data/fetching/userApiKey';
import { sanitizeInput } from '@/lib/utilities/safety/sanitize';

type ActionResult = {
   error?: string;
   success?: any;
}

export const registerServerBotAction = async (
   values: z.infer<typeof ServerBotSchema>, 
   userId: string, 
   homeServerId: string
): Promise<ActionResult> => {

   try {
       if (!userId) {
           throw new Error('User ID is required');
       }

       if (!homeServerId) {
           throw new Error('Server ID is required');
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
           const fetchedKey = await fetchUserApiKey(userId, model);
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
               }
           }
       });

       return { success: newBot };

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