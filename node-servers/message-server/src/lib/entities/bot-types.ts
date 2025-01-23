interface BotInstance {
    config: BotConfiguration;
    channels: ChannelInfo[];
    channelTimers: Map<string, ChannelTimer>;
}

interface ChannelInfo {
    id: string;
    name: string;
}

interface ChannelTimer {
    timer: NodeJS.Timeout;
    lastMessageTime: number;
}

interface ApiKey {
    id: string;
    key: string;
    isActive: boolean;
    model: string;
    userId: string;
}

interface BotConfiguration {
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

export type { BotConfiguration, BotInstance, ApiKey, ChannelTimer, ChannelInfo };