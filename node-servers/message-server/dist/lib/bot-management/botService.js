import { db } from "../messages/messageDbConnection.js";
import { llmApi } from "./llm-api/controller.js";
import { generatePrompt } from "./prompt/generatePrompt.js";
import { processMessage } from "./prompt/processMessage.js";
export class BotServiceManager {
    constructor(io) {
        this.bots = new Map();
        this.io = io;
    }
    async Initialize() {
        try {
            // Get all active bot configurations
            const botConfigs = await db.botConfiguration.findMany({
                where: {
                    isActive: true
                }
            });
            for (const config of botConfigs) {
                await this.startBot(config);
            }
        }
        catch (error) {
            console.error('Failed to initialize bot service manager: ', error);
        }
    }
    async startBot(config) {
        try {
            // Check if bot is already running
            if (this.bots.has(config.id)) {
                console.log(`Bot ${config.botName} is already running`);
                return;
            }
            // DB operations and initial setup
            const botInstance = await this.coldStartBot(config);
            // Set up timers and start the bot running
            await this.warmStartBot(botInstance);
            console.log(`Bot ${config.botName} started successfully`);
        }
        catch (error) {
            console.error(`Failed to start bot ${config.botName}:`, error);
            await this.cleanupBot(config.id);
            throw error;
        }
    }
    async coldStartBot(config) {
        // Database operations and initial setup
        const rawChannels = await db.channel.findMany({
            where: {
                serverId: config.homeServerId
            }
        });
        const channels = rawChannels.map(channel => ({
            id: channel.id,
            name: channel.name
        }));
        return {
            config,
            channels,
            channelTimers: new Map()
        };
    }
    async warmStartBot(botInstance) {
        const { config, channels } = botInstance;
        const channelTimers = new Map();
        // Set up message scheduling for each channel
        channels.forEach(channel => {
            const scheduleChannelMessage = () => {
                const randomMultiplier = 0.5 + Math.random();
                const baseFrequency = parseInt(config.chatFrequency) * 1000;
                const nextMessageDelay = Math.floor(baseFrequency * randomMultiplier);
                const timer = setTimeout(async () => {
                    try {
                        await this.sendMessage(config, channel.id, channel.name);
                        scheduleChannelMessage();
                    }
                    catch (error) {
                        console.error(`Failed to send message for bot ${config.botName} in channel ${channel.name}:`, error);
                        scheduleChannelMessage();
                    }
                }, nextMessageDelay);
                channelTimers.set(channel.id, {
                    timer,
                    lastMessageTime: Date.now()
                });
            };
            scheduleChannelMessage();
        });
        botInstance.channelTimers = channelTimers;
        this.bots.set(config.id, botInstance);
    }
    async cleanupBot(botId) {
        const existingBot = this.bots.get(botId);
        if (existingBot) {
            existingBot.channelTimers.forEach((timer) => {
                clearTimeout(timer.timer);
            });
            this.bots.delete(botId);
        }
    }
    async sendMessage(config, channelId, channelName) {
        try {
            const message = await this.generateMessage(config, channelId, channelName);
            const channelKey = `chat:${channelId}:messages`;
            this.io.to(channelId).emit(channelKey, message);
        }
        catch (error) {
            console.error('Failed to send message for bot:', config.id, error);
        }
    }
    async generateMessage(config, channelId, channelName) {
        const recentMessages = await db.message.findMany({
            where: {
                channelId
            },
            include: {
                member: {
                    include: {
                        user: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 30
        });
        const userPrompt = generatePrompt(recentMessages, channelName);
        const message = await llmApi(config, userPrompt);
        const processedMessage = processMessage(message, config.botName);
        console.log(processedMessage);
        return processedMessage;
    }
    async deactivateBot(botId) {
        try {
            const botInstance = this.bots.get(botId);
            if (!botInstance) {
                return { error: 'Bot not found' };
            }
            for (const [channelId, timer] of botInstance.channelTimers) {
                clearTimeout(timer.timer);
            }
            await db.botConfiguration.update({
                where: { id: botId },
                data: { isActive: false }
            });
            this.bots.delete(botId);
            return true;
        }
        catch (error) {
            console.error('Failed to deactivate bot:', botId, error);
            throw error;
        }
    }
}
//# sourceMappingURL=botService.js.map