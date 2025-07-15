import { BotConfiguration } from '../../../../entities/bot-types.js';
import { getApiKey } from '../../../../../util/getApiKey.js';
import OpenAI from 'openai';


function getOpenRouterApiKey(apiKeyId?: string): string | undefined {
  if (apiKeyId) {
    return getApiKey(apiKeyId, 'openrouter');
  }
  return process.env.OPENROUTER_API_KEY;
}
// TODO: Figure out if using the SDK actually slows things down - more declarative but is it slower?
export async function openRouter(config: BotConfiguration, userPrompt: string) {
  const apiKey = getOpenRouterApiKey(config.apiKeyId);

  if (!apiKey) {
    console.error(`OpenRouter API key not found for bot ${config.botName}`);
    return {
      message: 'I apologize, but my connection to the AI service is not configured correctly. Please contact an administrator.',
      modelName: config.modelName,
    };
  }

  const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: apiKey,
    defaultHeaders: {
      'HTTP-Referer': 'https://echosphere.dev',
      'X-Title': 'Echosphere',
    },
  });

  try {
    const completion = await openai.chat.completions.create({
      model: config.modelName,
      messages: [
        { role: 'system', content: config.systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 4000,
    });

    const messageContent = completion.choices[0]?.message?.content;

    if (!messageContent) {
      console.error('Unexpected API response format from OpenRouter:', completion);
      throw new Error('Invalid API response format');
    }

    return {
      message: messageContent,
      modelName: config.modelName,
    };
  } catch (error) {
    console.error(`OpenRouter API call failed for bot ${config.botName}:`, error);
    return {
      message: 'I apologize, but I am having trouble responding right now. Please try again later.',
      modelName: config.modelName,
    };
  }
} 