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

    private async startBot(config: BotConfiguration) {
        try {
            const rawChannels = await db.channel.findMany({
                where: {
                    serverId: config.homeServerId
                }
            });

            const channels = rawChannels.map(channel => ({
                id: channel.id,
                name: channel.name
            }));

            const channelTimers = new Map<string, ChannelTimer>();

            channels.forEach(channel => {
                const scheduleChannelMessage = () => {
                    const randomMultiplier = 0.5 + Math.random();
                    const baseFrequency = parseInt(config.chatFrequency) * 1000;
                    const nextMessageDelay = Math.floor(baseFrequency * randomMultiplier);

                    const timer = setTimeout( async () => {
                        await this.sendMessage(config, channel.id, channel.name);
                        scheduleChannelMessage();
                    }, nextMessageDelay);

                    channelTimers.set(channel.id, {
                        timer,
                        lastMessageTime: Date.now()
                    });
                }

                scheduleChannelMessage();
            });

            const botInstance: BotInstance = {
                config,
                channels,
                channelTimers
            };

            this.bots.set(config.id, botInstance);
        } catch (error) {
            console.error('Failed to start bot for config:', config.id, error);
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
