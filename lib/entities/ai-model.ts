export interface AIModel {
    name: string;
    maxTokens: number;
    isAvailable: boolean;
    provider: 'openai' | 'anthropic' | 'google' | 'meta-llama' | 'mistralai' | 'nousresearch' | 'deepseek' | 'other';
    pricing?: {
        input: number;
        output: number;
    }
    maxSystemPromptLength: number;
}