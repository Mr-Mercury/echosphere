import { db } from "../messages/messageDbConnection.js";
import { Server as IoServer } from 'socket.io';
import { messagePostHandler } from "../messages/message-handler.js";
import { llmApi } from "./llm-api/controller.js";
import { generatePrompt } from "./prompt/generatePrompt.js";
import { BotConfiguration, BotInstance, ChannelInfo, ChannelTimer } from "../entities/bot-types.js";
import { processMessage } from "./prompt/processMessage.js";

export class BotServiceManager {
    /* TODO: Scaling Optimization
     * Current: In-memory Map for bot configs
     * Future: Implement hybrid approach:
     * - Keep Map for fast access
     * - Add Redis shared cache between instances
     * - Use pub/sub for config updates
     * - Add periodic DB sync
     */
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

            console.log(`Starting bot ${config.botName} (${config.id})...`);

            // DB operations and initial setup
            const botInstance = await this.coldStartBot(config);
            
            console.log(`Bot ${config.botName} cold start complete, proceeding to warm start...`);
            
            // Set up timers and start the bot running
            await this.warmStartBot(botInstance);

            console.log(`Bot ${config.botName} started successfully with ${botInstance.channels.length} channels`);
            console.log(`Active bots: ${Array.from(this.bots.keys()).length}`);
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

    private async warmStartBot(botInstance: BotInstance) {
        const { config, channels } = botInstance;
        const channelTimers = new Map<string, ChannelTimer>();

        // CRITICAL: Add the bot to the map BEFORE any scheduling logic
        this.bots.set(config.id, botInstance);
        botInstance.channelTimers = channelTimers;

        // Set up message scheduling for each channel
        channels.forEach(channel => {
            const scheduleChannelMessage = () => {
                // Only schedule next message if bot is still active
                if (!this.bots.has(config.id)) {
                    console.log(`Bot ${config.botName} is deactivated, stopping message scheduling`);
                    return;
                }

                const randomMultiplier = 0.5 + Math.random();
                
                // Get messages per minute from the config
                const messagesPerMinute = config.messagesPerMinute || 3; // Default to 3 if not set

                // Convert messages per minute to delay in milliseconds
                const baseFrequencyInSeconds = 60 / messagesPerMinute;
                const nextMessageDelay = Math.floor(baseFrequencyInSeconds * randomMultiplier * 1000);

                console.log(`Scheduling next message for ${config.botName} in ${Math.floor(nextMessageDelay/1000)} seconds`);

                const timer = setTimeout(async () => {
                    try {
                        // Double check bot is still active before sending and scheduling next
                        if (this.bots.has(config.id)) {
                            await this.sendMessage(config, channel.id, channel.name);
                            scheduleChannelMessage();
                        } else {
                            console.log(`Bot ${config.botName} is no longer active, stopping schedule chain`);
                        }
                    } catch (error) {
                        console.error(`Failed to send message for bot ${config.botName}:`, error);
                        // Only reschedule on error if bot is still active
                        if (this.bots.has(config.id)) {
                            scheduleChannelMessage();
                        }
                    }
                }, nextMessageDelay);

                channelTimers.set(channel.id, {
                    timer,
                    lastMessageTime: Date.now()
                });
            };

            scheduleChannelMessage();
        });
    }

    public async toggleBot(botId: string, desiredState: boolean) {
        try {
            console.log('BotService toggleBot called:', { botId, desiredState });
            
            // First check if current state matches desired state to avoid unnecessary operations
            const isCurrentlyActive = this.bots.has(botId);
            if (isCurrentlyActive === desiredState) {
                console.log(`Bot ${botId} is already in desired state (${desiredState})`);
                return;
            }

            // Start transaction to ensure DB and runtime state stay in sync
            const updatedConfig = await db.$transaction(async (tx) => {
                // Update DB first
                const config = await tx.botConfiguration.update({
                    where: { id: botId },
                    data: { isActive: desiredState }
                });

                if (desiredState) {
                    // Activation
                    await this.startBot(config as BotConfiguration);
                    console.log('Bot activated successfully');
                } else {
                    // Deactivation
                    const deactivated = await this.deactivateBot(botId);
                    if (!deactivated) {
                        throw new Error(`Failed to deactivate bot ${botId}`);
                    }
                    console.log('Bot deactivated successfully');
                }

                return config;
            });

            console.log(`Bot ${botId} successfully toggled to ${desiredState}`);
            return updatedConfig;

        } catch (error) {
            console.error('Failed to toggle bot:', error);
            // Attempt recovery - ensure bot is stopped if we hit an error
            if (!desiredState) {
                await this.forceCleanupBot(botId);
            }
            throw error;
        }
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
            console.log(`Attempting to send message for bot ${config.botName} in channel ${channelName}`);
            
            // Add check to see if bot is still active
            if (!this.bots.has(config.id)) {
                console.log(`Bot ${config.botName} is no longer active, skipping message send`);
                return;
            }

            const message = await this.generateMessage(config, channelId, channelName);
            
            // Second check in case bot was deactivated while generating message
            if (!this.bots.has(config.id)) {
                console.log(`Bot ${config.botName} was deactivated while generating message, skipping send`);
                return;
            }

            // First save to DB using messagePostHandler
            const params = {
                userId: config.botUserId,
                serverId: config.homeServerId,
                channelId,
                conversationId: null,
                fileUrl: null,
                content: message.content,
                modelName: message.modelName,
                type: 'channel' as const
            };

            console.log(`Bot ${config.botName} sending message: "${message.content.substring(0, 30)}..."`);

            const result = await messagePostHandler(params);
            
            if (!result.message) {
                throw new Error('Failed to save message to database');
            }

            const channelKey = `chat:${channelId}:messages`;
            
            console.log('Bot attempting to send message:', {
                botName: config.botName,
                channelId,
                channelKey,
                messageContent: typeof result.message === 'string' ? result.message.substring(0, 30) : result.message.content.substring(0, 30),
                socketRoomSize: (await this.io.in(channelId).allSockets()).size
            });
            
            // Emit the saved message from the DB
            this.io.to(channelId).emit(channelKey, result.message);
            console.log(`Bot ${config.botName} message sent successfully`);

        } catch (error) {
            console.error(`Failed to send message for bot ${config.botName}:`, error);
        }
    }

    private async generateMessage(config: BotConfiguration, channelId: string, channelName: string) {
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
            console.log(`Generated prompt for ${config.botName}:`, userPrompt.substring(0, 100) + "...");
            
            const response = await llmApi(config, userPrompt);
            
            console.log(`LLM API response object for ${config.botName}:`, response);
            
            // Direct check for message property
            if (response && response.message) {
                console.log(`Using standard response format for ${config.botName}`);
                const processedMessage = processMessage(response.message, config.botName, response.modelName);
                return processedMessage;
            } 
            // Fallback to default message
            else {
                console.log(`Using fallback message for ${config.botName}`);
                return processMessage("I'm having trouble generating a response right now.", config.botName, config.modelName);
            }
        } catch (error) {
            console.error(`Failed to generate message for bot ${config.botName}:`, error);
            return processMessage("I'm having trouble generating a response right now.", config.botName, config.modelName);
        }
    }

    private async deactivateBot(botId: string): Promise<boolean> {
        try {
            console.log(`Attempting to deactivate bot ${botId}`);
            const botInstance = this.bots.get(botId);

            if (!botInstance) {
                console.log(`Bot ${botId} not found in active bots map`);
                return true; 
            }

            // Clear all channel timers
            for (const [channelId, timer] of botInstance.channelTimers) {
                try {
                    clearTimeout(timer.timer);
                    console.log(`Cleared timer for channel ${channelId}`);
                } catch (error) {
                    console.error(`Failed to clear timer for channel ${channelId}:`, error);
                }
            }

            botInstance.channelTimers.clear();
            const removed = this.bots.delete(botId);

            if (!removed) {
                console.error(`Failed to remove bot ${botId} from bot map`);
                return false;
            }

            console.log(`Bot ${botId} successfully deactivated and removed from bot map`);
            return true;
        } catch (error) {
            console.error('Failed to deactivate bot:', botId, error);
            return false;
        }
    }

    // STRICTLY for error scenarios - do not use for normal bot deactivation
    private async forceCleanupBot(botId: string) {
        try {
            console.log(`Forcing cleanup of bot ${botId}`);
            const botInstance = this.bots.get(botId);
            
            if (botInstance) {
                // Force clear all timers
                botInstance.channelTimers.forEach((timer) => {
                    try {
                        clearTimeout(timer.timer);
                    } catch (e) {
                        console.error(`Failed to clear timer during force cleanup:`, e);
                    }
                });
                
                botInstance.channelTimers.clear();
                this.bots.delete(botId);
            }

            // Ensure DB is in correct state
            await db.botConfiguration.update({
                where: { id: botId },
                data: { isActive: false }
            });

            console.log(`Forced cleanup of bot ${botId} completed`);
        } catch (error) {
            console.error(`Critical: Failed force cleanup of bot ${botId}:`, error);
        }
    }

    public getBotIds(): IterableIterator<string> {
        return this.bots.keys();
    }

    public async stopAll() {
        console.log('Stopping all bots...');
        const botIds = Array.from(this.bots.keys());
        
        for (const botId of botIds) {
            try {
                await this.deactivateBot(botId);
                console.log(`Bot ${botId} stopped successfully`);
            } catch (error) {
                console.error(`Failed to stop bot ${botId}:`, error);
            }
        }
        
        console.log(`All bots stopped: ${botIds.length} bots`);
    }
    
    public async stopAllServerBots(serverId: string) {
        console.log(`Stopping all bots for server ${serverId}...`);
        const botIds = Array.from(this.bots.keys());
        let stopCount = 0;
        
        interface BotResult {
            id: string;
            name: string;
        }
        
        interface BotErrorResult extends BotResult {
            error: string;
        }
        
        const results: {
            successful: BotResult[];
            failed: BotErrorResult[];
        } = {
            successful: [],
            failed: []
        };
        
        // Filter bots belonging to this server first
        const serverBotIds = botIds.filter(botId => {
            const botInstance = this.bots.get(botId);
            return botInstance && botInstance.config.homeServerId === serverId;
        });
        
        if (serverBotIds.length === 0) {
            console.log(`No active bots found for server ${serverId}`);
            return { count: 0, results };
        }
        
        // Process each bot in sequence to ensure we handle each one properly
        for (const botId of serverBotIds) {
            const botInstance = this.bots.get(botId);
            if (!botInstance) continue;
            
            try {
                // Use a transaction for each bot to keep DB and runtime state in sync
                await db.$transaction(async (tx) => {
                    // Deactivate bot in memory
                    const deactivated = await this.deactivateBot(botId);
                    if (!deactivated) {
                        throw new Error(`Failed to deactivate bot ${botId} in memory`);
                    }
                    
                    // Update database within transaction
                    await tx.botConfiguration.update({
                        where: { id: botId },
                        data: { isActive: false }
                    });
                });
                
                console.log(`Bot ${botId} (${botInstance.config.botName}) stopped successfully`);
                stopCount++;
                results.successful.push({
                    id: botId, 
                    name: botInstance.config.botName
                });
            } catch (error) {
                console.error(`Failed to stop bot ${botId} (${botInstance.config.botName}):`, error);
                results.failed.push({
                    id: botId,
                    name: botInstance.config.botName,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
                
                // Attempt recovery for this specific bot
                await this.forceCleanupBot(botId);
            }
        }
        
        console.log(`Server ${serverId} bots stopped: ${stopCount}/${serverBotIds.length} bots`);
        return { count: stopCount, results };
    }
}
