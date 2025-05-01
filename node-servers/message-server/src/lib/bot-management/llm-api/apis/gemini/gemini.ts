import { BotConfiguration } from "../../../../entities/bot-types.js";
import { getApiKey } from "../../../../../util/getApiKey.js";
import { abortControllerAssembler } from "../../../../../util/api-req-utils.js";

export async function gemini(config: BotConfiguration, userPrompt: string) {
    const geminiBaseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${config.modelName}:generateContent?key=`;

    const messages = {
        "contents": {           
            "parts": [
                {
                    'text': config.systemPrompt
                },
                {
                    'text': userPrompt
                }
            ]
        }
    }

    try {
        const apiKey = getApiKey(config.apiKeyId, config.modelName);

        if (!apiKey) {
            throw new Error('API key retrieval failed or no API key found in gemini.ts');
        }

        const {abortController, timeoutId} = abortControllerAssembler(30000);

        const response = await fetch(`${geminiBaseUrl}${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: config.modelName,
                messages: messages,
                temperature: 0.5,
                max_tokens: 4000
            }),
            signal: abortController.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('ChatGPT API Error:', {
                status: response.status,
                statusText: response.statusText,
                errorData
            });
            throw new Error(`API request failed with status ${response.status}: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();

        console.log('API Response:', JSON.stringify(data, null, 2)); // Debug log
        
        if (!data?.choices?.[0]?.message?.content) {
            console.error('Unexpected API response format:', data);
            throw new Error('Invalid API response format');
        }

        const messageContent = data.choices[0].message.content;
        
        // Return an object with message and modelName instead of just the message string
        return {
            message: messageContent,
            modelName: config.modelName
        };
    } catch (error) {
        console.error(`ChatGPT API call failed for bot ${config.botName}:`, error);
        // Return an object with the error message and modelName
        return {
            message: `I apologize, but I'm having trouble responding right now. Please try again later.`,
            modelName: config.modelName
        };
    }
}