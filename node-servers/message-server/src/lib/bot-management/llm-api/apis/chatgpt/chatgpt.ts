import { BotConfiguration } from "../../../../entities/bot-types.js";
import { getApiKey } from "../../../../../util/getApiKey.js";

export async function chatgpt(config: BotConfiguration, userPrompt: string) {
    const messages = [
        {role: 'system', content: config.systemPrompt},
        {role: 'user', content: userPrompt}
    ];

    try {
        const apiKey = getApiKey(config.apiKeyId);
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: config.modelName,
                messages: messages,
                temperature: 0.5,
                max_tokens: 4000
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('ChatGPT API Error:', errorData);
            throw new Error(`API request failed with status ${response.status}: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error('Unexpected API response format:', data);
            throw new Error('Invalid API response format');
        }

        return data.choices[0].message.content;
    } catch (error) {
        console.error('ChatGPT API call failed:', error);
        return `I apologize, but I'm having trouble responding right now. Please try again later.`;
    }
}