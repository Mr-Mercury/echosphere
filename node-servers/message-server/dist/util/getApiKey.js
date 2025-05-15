// TODO: Add API key management (use env secret, fetch encrypted api from db, 
// process and send to appropriate LLM)
export function getApiKey(apiKeyId, modelName) {
    if (!apiKeyId && modelName === 'gpt-4o' || modelName === 'gpt-4o-mini') {
        return process.env['CHATGPT_API_KEY'];
    }
    if (!apiKeyId && modelName === 'gemini-1.5-pro') {
        return process.env['GEMINI_API_KEY'];
    }
    if (apiKeyId === 'our-api-key') {
        return process.env['CHATGPT_API_KEY'];
    }
    return process.env['CHATGPT_API_KEY'];
}
//# sourceMappingURL=getApiKey.js.map