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
    //The fully constructed prompt including system prompt and user prompt.
    systemPrompt: string;
    modelName: string;
    description: string;
    //The raw prompt or base instruction template entered by the user during bot c
    prompt: string;
    messagesPerMinute: number;
    useSystemKey: boolean;
    apiKeyId: string;
    botUserId: string;
}

export type { BotConfiguration, BotInstance, ApiKey, ChannelTimer, ChannelInfo };