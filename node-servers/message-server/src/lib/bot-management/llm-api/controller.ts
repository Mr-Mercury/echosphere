import { chatgpt } from "./apis/chatgpt/chatgpt.js";
import { gemini } from "./apis/gemini/gemini.js";
import { openRouter } from "./apis/openrouter/openrouter.js";
import { BotConfiguration } from "../../entities/bot-types.js";
import { AVAILABLE_MODELS } from "@shared/config/models.js";
// Helper function to get provider for a model
function getProviderForModel(modelName: string): string | undefined {
    const model = AVAILABLE_MODELS[modelName];
    return model?.provider;
}

export async function llmApi(config: BotConfiguration, userPrompt: string) {
    try {
        if (!config.apiKeyId) {
            console.error(`No API key ID available for bot ${config.botName}`);
            return { message: null, modelName: config.modelName };
        }

        const provider = getProviderForModel(config.modelName);
        
        if (!provider) {
            throw new Error(`Model ${config.modelName} not found in AVAILABLE_MODELS`);
        }

        // Route based on provider
        switch (provider) {
            case 'openai':
                return await chatgpt(config, userPrompt);
            case 'google':
                return await gemini(config, userPrompt);
            case 'openrouter':
            case 'mistralai':
            case 'meta-llama':
            case 'nousresearch':
            case 'anthropic':
            case 'other':
                // All non-direct providers go through OpenRouter
                return await openRouter(config, userPrompt);
            default:
                throw new Error(`No API handler found for provider: ${provider}`);
        }
    } catch (error) {
        console.error(`Error in llmApi for bot ${config.botName}:`, error);
        return { message: null, modelName: config.modelName };
    }
}