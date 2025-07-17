// TODO: Add API key management (use env secret, fetch encrypted api from db, 
// process and send to appropriate LLM)
export function getApiKey(apiKeyId, modelName) {
    console.log(`getApiKey called with apiKeyId: ${apiKeyId}, modelName: ${modelName}`);
    console.log(`Available env vars: OPENROUTER_API_KEY=${process.env.OPENROUTER_API_KEY ? 'SET' : 'NOT SET'}, OPENAI_API_KEY=${process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET'}, GOOGLE_GEMINI_API_KEY=${process.env.GOOGLE_GEMINI_API_KEY ? 'SET' : 'NOT SET'}`);
    // Handle provider-based API key IDs first
    if (apiKeyId === 'our-openrouter-key') {
        console.log('Using OpenRouter API key from environment');
        const key = process.env['OPENROUTER_API_KEY'];
        console.log(`OPENROUTER_API_KEY is ${key ? 'available' : 'NOT available'}`);
        return key;
    }
    if (apiKeyId === 'our-google-key') {
        console.log('Using Google API key from environment');
        const key = process.env['GOOGLE_GEMINI_API_KEY'];
        console.log(`GOOGLE_GEMINI_API_KEY is ${key ? 'available' : 'NOT available'}`);
        return key;
    }
    if (apiKeyId === 'our-openai-key') {
        console.log('Using OpenAI API key from environment');
        const key = process.env['OPENAI_API_KEY'];
        console.log(`OPENAI_API_KEY is ${key ? 'available' : 'NOT available'}`);
        return key;
    }
    // Legacy handling for old apiKeyId format - determine provider from model name
    if (apiKeyId === 'our-api-key') {
        // Gemini models
        if (modelName === 'gemini-2.0-flash-lite' || modelName.startsWith('gemini')) {
            console.log('Legacy our-api-key with Gemini model, using Google API key');
            const key = process.env['GOOGLE_GEMINI_API_KEY'];
            console.log(`GOOGLE_GEMINI_API_KEY is ${key ? 'available' : 'NOT available'}`);
            return key;
        }
        // OpenAI models
        if (modelName.startsWith('gpt')) {
            console.log('Legacy our-api-key with GPT model, using OpenAI API key');
            const key = process.env['OPENAI_API_KEY'];
            console.log(`OPENAI_API_KEY is ${key ? 'available' : 'NOT available'}`);
            return key;
        }
        // OpenRouter models (check specific model names)
        const openRouterModels = [
            'mistralai/mistral-large',
            'meta-llama/llama-3-70b-instruct',
            'nousresearch/nous-hermes-2-mixtral-8x7b-dpo',
            'neversleep/llama-3-lumimaid-70b',
            'aion-labs/aion-rp-llama-3.1-8b',
            'lynn/soliloquy-l3',
            'claude-3-5-sonnet-20240620'
        ];
        if (openRouterModels.includes(modelName)) {
            console.log('Legacy our-api-key with OpenRouter model, using OpenRouter API key');
            const key = process.env['OPENROUTER_API_KEY'];
            console.log(`OPENROUTER_API_KEY is ${key ? 'available' : 'NOT available'}`);
            return key;
        }
        // Default to OpenAI for unknown models with our-api-key
        console.log('Legacy our-api-key with unknown model, defaulting to OpenAI');
        const key = process.env['OPENAI_API_KEY'];
        console.log(`OPENAI_API_KEY is ${key ? 'available' : 'NOT available'}`);
        return key;
    }
    // Handle legacy provider names passed as modelName
    if (modelName === 'openrouter') {
        console.log('Legacy openrouter provider name detected, using OpenRouter API key');
        return process.env['OPENROUTER_API_KEY'];
    }
    // Model-based fallbacks (for backward compatibility)
    if (modelName === 'gemini-2.0-flash-lite' || modelName.startsWith('gemini')) {
        console.log('Gemini model detected, using Google API key');
        return process.env['GOOGLE_GEMINI_API_KEY'];
    }
    if (modelName.startsWith('gpt')) {
        console.log('GPT model detected, using OpenAI API key');
        return process.env['OPENAI_API_KEY'];
    }
    // Fallback if no specific logic matches
    console.warn(`API key not found for model: ${modelName} with apiKeyId: ${apiKeyId}`);
    return undefined;
}
//# sourceMappingURL=getApiKey.js.map