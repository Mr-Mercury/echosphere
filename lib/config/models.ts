import { AIModel } from "../entities/ai-model";
import { OPENROUTER_MODELS } from "./openrouter";

// Define color scheme for providers
export const PROVIDER_COLORS = {
    'openai': {
        primary: '#10b981', // emerald-500
        secondary: '#6366f1', // indigo-500
    },
    'anthropic': {
        primary: '#8b5cf6', // violet-500
        secondary: '#a78bfa', // violet-400
    },
    'google': {
        primary: '#4285F4', // google blue
        secondary: '#64B5F6', // slightly darker blue
    },
    'mistralai': {
        primary: '#0095ff',
        secondary: '#66c2ff',
    },
    'meta-llama': {
        primary: '#ff4500',
        secondary: '#ff8c66',
    },
    'nousresearch': {
        primary: '#ff69b4', // hot pink
        secondary: '#ff99cc',
    },
    'other': {
        primary: '#22c55e',
        secondary: '#22c55e',
    },
    'default': '#22c55e', // green-500
} as const;

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
        maxSystemPromptLength: 2000,
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
        maxSystemPromptLength: 1000,

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
        maxSystemPromptLength: 3000,
    },
    'gemini-2.0-flash-lite': {
        name: 'Gemini 2.0 Flash Lite',
        maxTokens: 128000,
        isAvailable: true,
        provider: 'google',
        maxSystemPromptLength: 3000,
    },
    ...OPENROUTER_MODELS
};

export const AVAILABLE_MODELS_IDS = Object.keys(AVAILABLE_MODELS);

// Map display model names to provider colors
export const MODEL_DISPLAY = {
    'Claude': {
        color: PROVIDER_COLORS.anthropic.primary,
        displayName: 'Claude',
        provider: 'anthropic'
    },
    'GPT': {
        color: PROVIDER_COLORS.openai.primary,
        displayName: 'GPT',
        provider: 'openai'
    },
    'GPT-4': {
        color: PROVIDER_COLORS.openai.primary,
        displayName: 'GPT-4',
        provider: 'openai'
    },
    'GPT-4o': {
        color: PROVIDER_COLORS.openai.primary,
        displayName: 'GPT-4o',
        provider: 'openai'
    },
    'GPT-4o Mini': {
        color: PROVIDER_COLORS.openai.primary,
        displayName: 'GPT-4o Mini',
        provider: 'openai'
    },
    'Claude 3.5 Sonnet': {
        color: PROVIDER_COLORS.anthropic.primary,
        displayName: 'Claude 3.5 Sonnet',
        provider: 'anthropic'
    },
    'Mistral': {
        color: '#0095ff', // Blue for Mistral
        displayName: 'Mistral',
        provider: 'mistral'
    },
    'Llama': {
        color: '#ff4500', // Orange for Llama
        displayName: 'Llama',
        provider: 'meta'
    },
    'Gemini 2.0 Flash Lite': {
        color: PROVIDER_COLORS.google.primary,
        displayName: 'Gemini 2.0 Flash Lite',
        provider: 'google'
    },
    'Mistral Large': {
        color: PROVIDER_COLORS.mistralai.primary,
        displayName: 'Mistral Large',
        provider: 'mistralai'
    },
    'Llama 3 70B Instruct': {
        color: PROVIDER_COLORS['meta-llama'].primary,
        displayName: 'Llama 3 70B Instruct',
        provider: 'meta-llama'
    },
    'Nous Hermes 2 Mixtral 8x7B DPO': {
        color: PROVIDER_COLORS.nousresearch.primary,
        displayName: 'Nous Hermes 2 Mixtral 8x7B DPO',
        provider: 'nousresearch'
    },
    'Llama 3 Lumimaid 70B': {
        color: PROVIDER_COLORS['meta-llama'].primary,
        displayName: 'Llama 3 Lumimaid 70B',
        provider: 'meta-llama'
    },
    'Aion-RP 1.0 (8B)': {
        color: PROVIDER_COLORS.other.primary,
        displayName: 'Aion-RP 1.0 (8B)',
        provider: 'other'
    },
    'Llama 3 Soliloquy 8B v2': {
        color: PROVIDER_COLORS['meta-llama'].primary,
        displayName: 'Llama 3 Soliloquy 8B v2',
        provider: 'meta-llama'
    },
    'default': {
        color: PROVIDER_COLORS.default,
        displayName: 'AI Assistant',
        provider: 'other'
    }
};

// Model filter options for UI components - organize by family then specific models
export const BOT_MODEL_OPTIONS = [
  'All Models',
  // Model families first
  'GPT',
  'Claude',
  'Mistral',
  'Llama',
  // Then specific models
  ...Object.values(AVAILABLE_MODELS)
    .map(model => model.name)
    // Filter out models that would be redundant with families
    .filter(name => name !== 'GPT' && name !== 'Claude' && name !== 'Mistral' && name !== 'Llama')
];