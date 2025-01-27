import { gpt4o } from "./apis/chatgpt/gpt4o.js";
import { BotConfiguration } from "../../entities/bot-types.js";

export async function llmApi(config: BotConfiguration, userPrompt: string) {
    switch (config.modelName) {
        case 'gpt-4o':
            return await gpt4o(config, userPrompt);
        default:
            throw new Error(`Model ${config.modelName} not found`);
    }
}