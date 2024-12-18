import { AIModel } from "../entities/ai-model";

export const AVAILABLE_MODELS: Record<string, AIModel> = {
    'gpt-4o': {
        name: 'GPT-4o',
        maxTokens: 8192,
        isAvailable: true,
        provider: 'openai',
        pricing: {
            input: 0.00015,
            output: 0.0006
        },
    },
    'gpt-4o-mini': {
        name: 'GPT-4o Mini',
        maxTokens: 4096,
        isAvailable: true,
        provider: 'openai',
        pricing: {
            input: 0.000015,
            output: 0.00006
        },
    },
    'claude-3-5-sonnet-20240620': {
        name: 'Claude 3.5 Sonnet',
        maxTokens: 128000,
        isAvailable: true,
        provider: 'anthropic',
        pricing: {
            input: 0.0000015,
            output: 0.000006
        },
    },
    'gemini-1.5-flash-002': {
        name: 'Gemini 1.5 Flash',
        maxTokens: 128000,
        isAvailable: true,
        provider: 'google',
    },
};

export const AVAILABLE_MODELS_IDS = Object.keys(AVAILABLE_MODELS);