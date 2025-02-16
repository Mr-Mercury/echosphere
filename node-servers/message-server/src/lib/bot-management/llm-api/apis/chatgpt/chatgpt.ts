import { BotConfiguration } from "../../../../entities/bot-types.js";
import { getApiKey } from "../../../../../util/getApiKey.js";

export async function chatgpt(config: BotConfiguration, userPrompt: string) {
    const messages = [
        {role: 'system', content: config.systemPrompt},
        {role: 'user', content: userPrompt}
    ]

    const apiKey = getApiKey(config.apiKeyId);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: config.modelName,
            messages: messages,
            temperature: 0.5,
            max_tokens: 4000
        })
    })

    const data = await response.json();
    return data.choices[0].message.content;
}