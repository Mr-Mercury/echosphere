interface BotInstance {
    config: BotConfig;
    timer: NodeJS.Timeout;
}

interface ApiKey {
    id: string;
    key: string;
    isActive: boolean;
    model: string;
    userId: string;
}

interface BotConfig {
    id: string;
    isActive: boolean;
    botName: string;
    homeServerId: string;
    botType: string;
    systemPrompt: string;
    modelName: string;
    description: string;
    prompt: string;
    chatFrequency: string;
    useSystemKey: boolean;
    apiKeyId: string;
    botUserId: string;
}

export type { BotConfig, BotInstance, ApiKey };