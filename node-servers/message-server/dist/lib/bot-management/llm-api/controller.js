export async function llmApi(config, userPrompt) {
    // For testing - return the prompt directly without calling the API
    return userPrompt;
    /* Comment out the API routing for now
    switch (config.modelName) {
        case 'gpt-4o':
            return await chatgpt(config, userPrompt);
        case 'gpt-4o-mini':
            return await chatgpt(config, userPrompt);
        default:
            throw new Error(`Model ${config.modelName} not found`);
    }
    */
}
//# sourceMappingURL=controller.js.map