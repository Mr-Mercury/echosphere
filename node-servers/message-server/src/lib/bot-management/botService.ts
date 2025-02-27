import { db } from "../messages/messageDbConnection.js";
import { Server as IoServer } from 'socket.io';
import { messagePostHandler } from "../messages/message-handler.js";
import { llmApi } from "./llm-api/controller.js";
import { generatePrompt } from "./prompt/generatePrompt.js";
import { BotConfiguration, BotInstance, ChannelInfo, ChannelTimer } from "../entities/bot-types.js";
import { processMessage } from "./prompt/processMessage.js";



export class BotServiceManager {
    private bots: Map<string, BotInstance> = new Map();
    private io: IoServer;

    constructor(io: IoServer) { 
        this.io = io;   
    }

    async Initialize() {
        try {
            // Get all active bot configurations
            const botConfigs = await db.botConfiguration.findMany({
                where: {
                    isActive: true
                }
            }) as unknown as BotConfiguration[];

            for (const config of botConfigs) {
                await this.startBot(config);
            }
        } catch (error) {
            console.error('Failed to initialize bot service manager: ', error);
        }
    }

    public async startBot(config: BotConfiguration) {
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
        } catch (error) {
            console.error(`Failed to start bot ${config.botName}:`, error);
            await this.cleanupBot(config.id);
            throw error;
        }
    }

    private async coldStartBot(config: BotConfiguration): Promise<BotInstance> {
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

    private async warmStartBot(botInstance: BotInstance) {
        const { config, channels } = botInstance;
        const channelTimers = new Map<string, ChannelTimer>();

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
                    } catch (error) {
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

    private async cleanupBot(botId: string) {
        const existingBot = this.bots.get(botId);
        if (existingBot) {
            existingBot.channelTimers.forEach((timer) => {
                clearTimeout(timer.timer);
            });
            this.bots.delete(botId);
        }
    }

    private async sendMessage(config: BotConfiguration, channelId: string, channelName: string) {
        try {
            const message = await this.generateMessage(config, channelId, channelName);
            const channelKey = `chat:${channelId}:messages`;
            this.io.to(channelId).emit(channelKey, message); 
        } catch (error) {
            console.error('Failed to send message for bot:', config.id, error);
        }
    }

    private async generateMessage(config: BotConfiguration, channelId: string, channelName: string) {
        try {
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
            
            if (!message) {
                throw new Error('No message generated from LLM API');
            }

            const processedMessage = processMessage(message, config.botName);
            return processedMessage;
        } catch (error) {
            console.error(`Failed to generate message for bot ${config.botName}:`, error);
            return processMessage("I'm having trouble generating a response right now.", config.botName);
        }
    }

    async deactivateBot(botId: string) {
        try {
            const botInstance = this.bots.get(botId);

            if (!botInstance) {
                return { error: 'Bot not found'};
            }

            for (const [channelId, timer] of botInstance.channelTimers) {
                clearTimeout(timer.timer);
            }

            await db.botConfiguration.update({
                where: { id: botId},
                data: { isActive: false }
            })

            this.bots.delete(botId);

            return true;
        } catch (error) {
            console.error('Failed to deactivate bot:', botId, error);
            throw error;
        }
    }
}
