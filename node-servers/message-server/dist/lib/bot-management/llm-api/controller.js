import { chatgpt } from "./apis/chatgpt/chatgpt.js";
export async function llmApi(config, userPrompt) {
    switch (config.modelName) {
        case 'gpt-4o':
            return await chatgpt(config, userPrompt);
        case 'gpt-4o-mini':
            return await chatgpt(config, userPrompt);
        default:
            throw new Error(`Model ${config.modelName} not found`);
    }
}
//# sourceMappingURL=controller.js.map