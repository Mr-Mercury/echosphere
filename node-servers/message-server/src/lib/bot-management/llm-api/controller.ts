import { gpt4o } from "./apis/chatgpt/gpt4o.js";

export async function llmApi(modelName: string, prompt: string) {
    switch (modelName) {
        case 'gpt-4o':
            return await gpt4o(prompt);
        default:
            throw new Error(`Model ${modelName} not found`);
    }
}