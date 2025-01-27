// TODO: Add API key management (use env secret, fetch encrypted api from db, 
// process and send to appropriate LLM)

export function getApiKey(apiKeyId: string) {
    return process.env['CHATGPT_API_KEY'];
}