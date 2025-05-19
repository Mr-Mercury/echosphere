// TODO: Add API key management (use env secret, fetch encrypted api from db, 
// process and send to appropriate LLM)

export function getApiKey(apiKeyId: string, modelName: string) {
    // If the model is a Gemini model, always attempt to use the GEMINI_API_KEY from environment variables.
    // The apiKeyId might be used in the future for more granular key selection for Gemini models.
    if (modelName === 'gemini-2.0-flash-lite' || modelName.startsWith('gemini')) {
        return process.env['GEMINI_API_KEY'];
    }

    // Existing logic for other models (e.g., OpenAI)
    if (!apiKeyId && modelName === 'gpt-4o' || modelName === 'gpt-4o-mini') { // Original logic had potential precedence issue here.
        return process.env['CHATGPT_API_KEY'];
    }

    if (apiKeyId === 'our-api-key') {
        return process.env['CHATGPT_API_KEY'];
    }

    // Default fallback for other cases (e.g., GPT models if the first condition wasn't met due to !apiKeyId)
    // or any other apiKeyId for GPT models.
    if (modelName.startsWith('gpt')) {
        return process.env['CHATGPT_API_KEY'];
    }
    
    // Fallback if no specific logic matches - this is safer than returning a wrong key.
    // The calling functions (gemini.ts, chatgpt.ts) check for a falsy apiKey and throw an error.
    console.warn(`API key not found for model: ${modelName} with apiKeyId: ${apiKeyId}`);
    return undefined;
}