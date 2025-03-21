import { db } from "../messages/messageDbConnection.js";
import { messagePostHandler } from "../messages/message-handler.js";
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
                serverId: config.homeServerId,
                type: 'TEXT' // Only get TEXT channels
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
                // Get messages per minute from the config
                const messagesPerMinute = config.messagesPerMinute || 3; // Default to 3 if not set
                // Convert messages per minute to delay in milliseconds
                const baseFrequencyInSeconds = 60 / messagesPerMinute;
                const nextMessageDelay = Math.floor(baseFrequencyInSeconds * randomMultiplier * 1000);
                console.log(`Scheduling next message for ${config.botName} in ${Math.floor(nextMessageDelay / 1000)} seconds (frequency: ${config.messagesPerMinute}, msgs/min: ${messagesPerMinute})`);
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
    async toggleBot(botId, desiredState) {
        try {
            console.log('BotService toggleBot called:', { botId, desiredState });
            if (!desiredState) {
                console.log('Deactivating bot...');
                const updatedConfig = await db.botConfiguration.update({
                    where: { id: botId },
                    data: { isActive: false }
                });
                console.log('Database updated for deactivation:', updatedConfig);
                await this.deactivateBot(botId);
                console.log('Bot deactivated successfully');
            }
            else {
                console.log('Activating bot...');
                const config = await db.botConfiguration.update({
                    where: { id: botId },
                    data: { isActive: true }
                });
                console.log('Database updated for activation:', config);
                await this.startBot(config);
                console.log('Bot activated successfully');
            }
        }
        catch (error) {
            console.error('Failed to toggle bot:', error);
            throw error;
        }
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
            // First save to DB using messagePostHandler
            const params = {
                userId: config.botUserId,
                serverId: config.homeServerId,
                channelId,
                conversationId: null,
                fileUrl: null,
                content: message.content,
                type: 'channel'
            };
            const result = await messagePostHandler(params);
            if (!result.message) {
                throw new Error('Failed to save message to database');
            }
            const channelKey = `chat:${channelId}:messages`;
            console.log('Bot attempting to send message:', {
                channelId,
                channelKey,
                messageContent: typeof result.message === 'string' ? result.message : result.message.content,
                socketRoomSize: (await this.io.in(channelId).allSockets()).size,
                message: result.message
            });
            // Emit the saved message from the DB
            this.io.to(channelId).emit(channelKey, result.message);
        }
        catch (error) {
            console.error('Failed to send message for bot:', config.id, error);
        }
    }
    async generateMessage(config, channelId, channelName) {
        try {
            const recentMessages = await db.message.findMany({
                where: {
                    channelId,
                    deleted: false
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
            if (!message) {
                throw new Error('No message generated from LLM API');
            }
            const processedMessage = processMessage(message, config.botName);
            return processedMessage;
        }
        catch (error) {
            console.error(`Failed to generate message for bot ${config.botName}:`, error);
            return processMessage("I'm having trouble generating a response right now.", config.botName);
        }
    }
    async deactivateBot(botId) {
        try {
            const botInstance = this.bots.get(botId);
            if (!botInstance) {
                console.log(`Bot ${botId} not found in active bots`);
                return true;
            }
            // Clear all channel timers
            for (const [channelId, timer] of botInstance.channelTimers) {
                clearTimeout(timer.timer);
            }
            // Clear the timers map
            botInstance.channelTimers.clear();
            // Remove the bot from the active bots map
            this.bots.delete(botId);
            console.log(`Bot ${botId} successfully deactivated and removed from bot map`);
            return true;
        }
        catch (error) {
            console.error('Failed to deactivate bot:', botId, error);
            throw error;
        }
    }
    getBotIds() {
        return this.bots.keys();
    }
}
//# sourceMappingURL=botService.js.map