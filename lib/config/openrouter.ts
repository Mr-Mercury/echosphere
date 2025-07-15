import { AIModel } from '../entities/ai-model';

// Models we'll access through OpenRouter
export const OPENROUTER_MODELS: Record<string, AIModel> = {
  'mistralai/mistral-large': {
    name: 'Mistral Large',
    maxTokens: 32768,
    isAvailable: true,
    provider: 'mistralai',
    pricing: {
      input: 0.000004, // $4/M tokens
      output: 0.000012, // $12/M tokens
    },
    maxSystemPromptLength: 2000,
  },
  'meta-llama/llama-3-70b-instruct': {
    name: 'Llama 3 70B Instruct',
    maxTokens: 8192,
    isAvailable: true,
    provider: 'meta-llama',
    pricing: {
      input: 0.0000009, // $0.9/M tokens
      output: 0.00000275, // $2.75/M tokens
    },
    maxSystemPromptLength: 2000,
  },
  'nousresearch/nous-hermes-2-mixtral-8x7b-dpo': {
    name: 'Nous Hermes 2 Mixtral 8x7B DPO',
    maxTokens: 32768,
    isAvailable: true,
    provider: 'nousresearch',
    pricing: {
      input: 0.0000006, // $0.6/M tokens
      output: 0.0000006, // $0.6/M tokens
    },
    maxSystemPromptLength: 2000,
  },
  'neversleep/llama-3-lumimaid-70b': {
    name: 'Llama 3 Lumimaid 70B',
    maxTokens: 8192,
    isAvailable: true,
    provider: 'meta-llama',
    pricing: {
      input: 0.000004, // $4/M tokens
      output: 0.000006, // $6/M tokens
    },
    maxSystemPromptLength: 2000,
  },
  'aion-labs/aion-rp-llama-3.1-8b': {
    name: 'Aion-RP 1.0 (8B)',
    maxTokens: 32768,
    isAvailable: true,
    provider: 'other',
    pricing: {
      input: 0.0000002, // $0.20/M tokens
      output: 0.0000002, // $0.20/M tokens
    },
    maxSystemPromptLength: 2000,
  },
  'lynn/soliloquy-l3': {
    name: 'Llama 3 Soliloquy 8B v2',
    maxTokens: 24576,
    isAvailable: true,
    provider: 'meta-llama',
    pricing: {
      input: 0,
      output: 0,
    },
    maxSystemPromptLength: 2000,
  },
}; 