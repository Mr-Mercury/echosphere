export interface AIModel {
    name: string;
    maxTokens: number;
    isAvailable: boolean;
    provider: 'openai' | 'anthropic' | 'google' | 'other';
    pricing?: {
        input: number;
        output: number;
    }
    maxSystemPromptLength: number;
}