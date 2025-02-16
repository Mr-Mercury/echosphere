// TODO: Add API key management (use env secret, fetch encrypted api from db, 
// process and send to appropriate LLM)

export function getApiKey(apiKeyId: string) {
    if (!apiKeyId) {
        return process.env['CHATGPT_API_KEY'];
    }

    if (apiKeyId === 'our-api-key') {
        return process.env['CHATGPT_API_KEY'];
    }

    return process.env['CHATGPT_API_KEY'];
}