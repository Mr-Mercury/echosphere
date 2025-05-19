import { getApiKey } from "../../../../../util/getApiKey.js";
import { abortControllerAssembler } from "../../../../../util/api-req-utils.js";
export async function gemini(config, userPrompt) {
    const geminiBaseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${config.modelName}:generateContent?key=`;
    // System prompt is now the first part of the 'user' role content
    const requestPayload = {
        "contents": [
            {
                "role": "user", // Or handle system prompt via systemInstruction if preferred and model supports
                "parts": [
                    {
                        "text": config.systemPrompt
                    },
                    {
                        "text": userPrompt
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.5, // config.temperature || 0.5 -> Use configured temperature or default
            "maxOutputTokens": 4000 //config.maxTokens || 4000 -> Use configured maxTokens or default
        }
    };
    try {
        const apiKey = getApiKey(config.apiKeyId, config.modelName);
        if (!apiKey) {
            throw new Error('API key retrieval failed or no API key found in gemini.ts');
        }
        const { abortController, timeoutId } = abortControllerAssembler(30000);
        const response = await fetch(`${geminiBaseUrl}${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestPayload), // Use the new requestPayload
            signal: abortController.signal
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
            let errorData = { message: "Failed to parse error response." };
            try {
                errorData = await response.json();
            }
            catch (parseError) {
                console.error('Gemini API Error: Failed to parse JSON response. Status:', response.status, response.statusText);
                try {
                    const errorText = await response.text();
                    console.error('Gemini API Error: Raw error response:', errorText);
                    errorData = { message: errorText, status: response.status };
                }
                catch (textError) {
                    console.error('Gemini API Error: Failed to read error response as text.');
                    errorData = { message: `API request failed with status ${response.status}: ${response.statusText}. Unable to parse error body.`, status: response.status };
                }
            }
            console.error('Gemini API Error:', {
                status: response.status,
                statusText: response.statusText,
                errorData
            });
            throw new Error(`API request failed with status ${response.status}: ${JSON.stringify(errorData)}`);
        }
        const data = await response.json();
        console.log('Gemini API Response:', JSON.stringify(data, null, 2)); // Debug log
        // Corrected response parsing for Gemini API
        const messageContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        // Check for safety ratings and blocked responses if necessary
        const candidate = data?.candidates?.[0];
        if (candidate && candidate.finishReason === 'SAFETY') {
            console.warn('Gemini API response was blocked due to safety settings:', candidate.safetyRatings);
            // Optionally, you could return a specific message here, or let it fall through
            // to the !messageContent check if text is indeed missing.
        }
        if (!messageContent) {
            console.error('Unexpected API response format from Gemini or empty content:', data);
            throw new Error('Invalid API response format from Gemini or empty content');
        }
        // Return an object with message and modelName
        return {
            message: messageContent,
            modelName: config.modelName
        };
    }
    catch (error) {
        console.error(`Gemini API call failed for bot ${config.botName}:`, error);
        // Return an object with the error message and modelName
        return {
            message: `I apologize, but I'm having trouble responding right now. Please try again later.`,
            modelName: config.modelName
        };
    }
}
//# sourceMappingURL=gemini.js.map