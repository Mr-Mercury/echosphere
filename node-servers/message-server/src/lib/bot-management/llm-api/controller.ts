import { chatgpt } from "./apis/chatgpt/chatgpt.js";
import { gemini } from "./apis/gemini/gemini.js";
import { BotConfiguration } from "../../entities/bot-types.js";

export async function llmApi(config: BotConfiguration, userPrompt: string) {
    try {
        if (!config.apiKeyId) {
            console.error(`No API key ID available for bot ${config.botName}`);
            return { message: null, modelName: config.modelName };
        }

        switch (config.modelName) {
            case 'gpt-4o':
                return await chatgpt(config, userPrompt);
            case 'gpt-4o-mini':
                return await chatgpt(config, userPrompt);
            case 'gemini-2.0-flash-lite':
                return await gemini(config, userPrompt);
            default:
                throw new Error(`Model ${config.modelName} not found`);
        }
    } catch (error) {
        console.error(`Error in llmApi for bot ${config.botName}:`, error);
        return { message: null, modelName: config.modelName };
    }
}