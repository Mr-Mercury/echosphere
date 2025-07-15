import { db } from "../messages/messageDbConnection.js";
import { messagePostHandler } from "../messages/message-handler.js";
import { llmApi } from "./llm-api/controller.js";
import { generatePrompt } from "./prompt/generatePrompt.js";
import { processMessage } from "./prompt/processMessage.js";
export class BotServiceManager {
    constructor(io) {
        /* TODO: Scaling Optimization
         * Current: In-memory Map for bot configs
         * Future: Implement hybrid approach:
         * - Keep Map for fast access
         * - Add Redis shared cache between instances
         * - Use pub/sub for config updates
         * - Add periodic DB sync
         */
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
            console.log(`Starting bot ${config.botName} (${config.id})...`);
            // DB operations and initial setup
            const botInstance = await this.coldStartBot(config);
            console.log(`Bot ${config.botName} cold start complete, proceeding to warm start...`);
            // Set up timers and start the bot running
            await this.warmStartBot(botInstance);
            console.log(`Bot ${config.botName} started successfully with ${botInstance.channels.length} channels`);
            console.log(`Active bots: ${Array.from(this.bots.keys()).length}`);
        }
        catch (error) {
            console.error(`Failed to start bot ${config.botName}:`, error);
            this.deactivateBotInMemory(config.id);
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
                // Ensure delay is at least a minimum, e.g., 1 second, to prevent overly rapid scheduling
                const effectiveDelay = Math.max(nextMessageDelay, 1000);
                console.log(`Scheduling next message for ${config.botName} in ${Math.floor(effectiveDelay / 1000)} seconds`);
                const timer = setTimeout(async () => {
                    try {
                        // Double check bot is still active before sending and scheduling next
                        if (this.bots.has(config.id)) {
                            await this.sendMessage(config, channel.id, channel.name);
                            scheduleChannelMessage();
                        }
                        else {
                            console.log(`Bot ${config.botName} is no longer active, stopping schedule chain`);
                        }
                    }
                    catch (error) {
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
    async toggleBot(botId, desiredState) {
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
                    await this.startBot(config);
                    console.log('Bot activated successfully');
                }
                else {
                    // Deactivation
                    const deactivatedInMemory = this.deactivateBotInMemory(botId);
                    if (!deactivatedInMemory) {
                        // Bot was not in memory, which might be okay if it was already stopped
                        console.warn(`Bot ${botId} was not found in active bots map during toggle to deactivate, but DB record updated.`);
                    }
                    else {
                        console.log('Bot deactivated successfully from memory');
                    }
                }
                return config;
            });
            console.log(`Bot ${botId} successfully toggled to ${desiredState}`);
            return updatedConfig;
        }
        catch (error) {
            console.error('Failed to toggle bot:', error);
            // Attempt recovery - ensure bot is stopped if we hit an error
            if (!desiredState) {
                await this.forceCleanupBot(botId);
            }
            throw error;
        }
    }
    deactivateBotInMemory(botId) {
        const existingBot = this.bots.get(botId);
        if (existingBot) {
            existingBot.channelTimers.forEach((timer) => {
                clearTimeout(timer.timer);
            });
            existingBot.channelTimers.clear(); // Clear the map itself
            this.bots.delete(botId);
            console.log(`Bot ${botId} deactivated from memory and timers cleared.`);
            return true;
        }
        console.log(`Bot ${botId} not found in active bots for in-memory deactivation.`);
        return false;
    }
    async sendMessage(config, channelId, channelName) {
        try {
            console.log(`Attempting to send message for bot ${config.botName} in channel ${channelName}`);
            // Add check to see if bot is still active
            if (!this.bots.has(config.id)) {
                console.log(`Bot ${config.botName} is no longer active, skipping message send`);
                return;
            }
            const messageData = await this.generateMessage(config, channelId, channelName);
            if (!messageData) {
                console.log(`Message generation skipped for ${config.botName} as it was deactivated or an error occurred.`);
                return;
            }
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
                content: messageData.content,
                modelName: messageData.modelName, // Use modelName from processed message
                type: 'channel'
            };
            console.log(`Bot ${config.botName} sending message: "${messageData.content.substring(0, 30)}..."`);
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
        }
        catch (error) {
            console.error(`Failed to send message for bot ${config.botName}:`, error);
        }
    }
    async generateMessage(config, channelId, channelName) {
        try {
            // Check 1: Before any heavy operation
            if (!this.bots.has(config.id)) {
                console.log(`Bot ${config.botName} is no longer active (check 1), skipping message generation in generateMessage`);
                return null;
            }
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
            // Check 2: Before LLM API call (if prompt generation was long)
            if (!this.bots.has(config.id)) {
                console.log(`Bot ${config.botName} is no longer active (check 2), skipping LLM call.`);
                return null;
            }
            const response = await llmApi(config, userPrompt);
            // Check 3: After LLM API call
            if (!this.bots.has(config.id)) {
                console.log(`Bot ${config.botName} was deactivated during LLM call (check 3), skipping message processing.`);
                return null;
            }
            console.log(`LLM API response object for ${config.botName}:`, response);
            if (response && response.message) {
                console.log(`Using standard response format for ${config.botName}`);
                return processMessage(response.message, config.botName, config.botUserId, response.modelName);
            }
            else {
                console.log(`Using fallback message for ${config.botName} due to missing/null LLM response message.`);
                return processMessage("I'm having trouble generating a response right now.", config.botName, config.botUserId, config.modelName);
            }
        }
        catch (error) {
            console.error(`Failed to generate message for bot ${config.botName}:`, error);
            // Check 4: In case of error, ensure bot is still active before returning fallback
            if (!this.bots.has(config.id)) {
                console.log(`Bot ${config.botName} was deactivated during error handling in generateMessage (check 4).`);
                return null;
            }
            return processMessage("I'm having trouble generating a response right now.", config.botName, config.botUserId, config.modelName);
        }
    }
    // STRICTLY for error scenarios - do not use for normal bot deactivation
    async forceCleanupBot(botId) {
        try {
            console.log(`Forcing cleanup of bot ${botId}`);
            const botInstance = this.bots.get(botId);
            if (botInstance) {
                // Force clear all timers
                botInstance.channelTimers.forEach((timer) => {
                    try {
                        clearTimeout(timer.timer);
                    }
                    catch (e) {
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
        }
        catch (error) {
            console.error(`Critical: Failed force cleanup of bot ${botId}:`, error);
        }
    }
    getBotIds() {
        return this.bots.keys();
    }
    async stopAll() {
        console.log('Stopping all bots...');
        const botIds = Array.from(this.bots.keys());
        if (botIds.length === 0) {
            console.log('No active bots to stop.');
            return { count: 0, results: { successful: [], failed: [] } };
        }
        try {
            // Batch update DB
            await db.botConfiguration.updateMany({
                where: { id: { in: botIds } },
                data: { isActive: false }
            });
            console.log(`Batch DB update successful for stopping ${botIds.length} bots.`);
            let deactivatedCount = 0;
            for (const botId of botIds) {
                if (this.deactivateBotInMemory(botId)) {
                    deactivatedCount++;
                    console.log(`Bot ${botId} stopped (in-memory) successfully`);
                }
                else {
                    // This case should be rare if botIds came from this.bots.keys()
                    console.warn(`Bot ${botId} was expected to be in memory but not found during stopAll.`);
                }
            }
            console.log(`All bots processed for stopping: ${deactivatedCount}/${botIds.length} bots successfully deactivated in memory.`);
            // For simplicity, results here just reflect the count. Detailed results would require more tracking.
            return { count: deactivatedCount, results: { successful: botIds.map(id => ({ id, name: 'Unknown' })), failed: [] } }; // Simplified result
        }
        catch (error) {
            console.error('Failed to stop all bots during batch DB update or in-memory cleanup:', error);
            // In case of batch DB error, bots might still be in memory. Attempt force cleanup for all known.
            for (const botId of botIds) {
                await this.forceCleanupBot(botId); // Fallback to force cleanup
            }
            throw error; // Re-throw the original error
        }
    }
    async stopAllServerBots(serverId) {
        console.log(`Stopping all bots for server ${serverId}...`);
        const serverBotInstances = Array.from(this.bots.values()).filter(botInstance => botInstance.config.homeServerId === serverId);
        const serverBotIds = serverBotInstances.map(instance => instance.config.id);
        const results = { successful: [], failed: [] };
        if (serverBotIds.length === 0) {
            console.log(`No active bots found for server ${serverId}`);
            return { count: 0, results };
        }
        try {
            // Batch update database
            await db.botConfiguration.updateMany({
                where: {
                    id: { in: serverBotIds },
                    homeServerId: serverId
                },
                data: { isActive: false }
            });
            console.log(`Batch DB update successful for stopping ${serverBotIds.length} bots on server ${serverId}.`);
            // Deactivate in memory
            for (const botInstance of serverBotInstances) {
                if (this.deactivateBotInMemory(botInstance.config.id)) {
                    results.successful.push({ id: botInstance.config.id, name: botInstance.config.botName });
                }
                else {
                    // This should ideally not happen if serverBotInstances came from this.bots
                    results.failed.push({
                        id: botInstance.config.id,
                        name: botInstance.config.botName,
                        error: 'Failed to deactivate bot in memory (was not found or error during cleanup)'
                    });
                    console.warn(`Bot ${botInstance.config.botName} (${botInstance.config.id}) failed in-memory deactivation during stopAllServerBots.`);
                }
            }
            const stopCount = results.successful.length;
            console.log(`Server ${serverId} bots stopped: ${stopCount}/${serverBotIds.length} bots processed.`);
            return { count: stopCount, results };
        }
        catch (error) {
            console.error(`Failed to stop all bots for server ${serverId}:`, error);
            // Attempt recovery for these specific bots if batch DB update failed or other error
            // forceCleanupBot also updates DB
            for (const botInstance of serverBotInstances) {
                try {
                    await this.forceCleanupBot(botInstance.config.id);
                    results.failed.push({
                        id: botInstance.config.id,
                        name: botInstance.config.botName,
                        error: error instanceof Error ? error.message : 'Main operation failed, cleanup attempted.'
                    });
                }
                catch (cleanupError) {
                    results.failed.push({
                        id: botInstance.config.id,
                        name: botInstance.config.botName,
                        error: `Main op failed, and cleanup also failed: ${cleanupError}`
                    });
                }
            }
            // Adjust successful count based on which ones might have been in results.successful before error
            results.successful = results.successful.filter(s => !results.failed.some(f => f.id === s.id));
            return { count: results.successful.length, results };
        }
    }
    async startAllServerBots(serverId) {
        console.log(`Starting all bots for server ${serverId}...`);
        const results = { successful: [], failed: [] };
        try {
            // Get all bot configurations for this server
            const allServerBotConfigs = await db.botConfiguration.findMany({
                where: { homeServerId: serverId }
            });
            // Filter for bots that are not currently active in memory
            const botConfigsToStart = allServerBotConfigs.filter(config => !this.bots.has(config.id));
            if (botConfigsToStart.length === 0) {
                console.log(`No inactive bots found to start for server ${serverId}`);
                return { count: 0, results };
            }
            const botIdsToStart = botConfigsToStart.map(config => config.id);
            // Batch update database to set isActive: true
            await db.botConfiguration.updateMany({
                where: {
                    id: { in: botIdsToStart },
                    homeServerId: serverId // Ensure we only update bots of this server
                },
                data: { isActive: true }
            });
            console.log(`Batch DB update successful for starting ${botIdsToStart.length} bots on server ${serverId}.`);
            // Start bots in memory
            for (const config of botConfigsToStart) {
                try {
                    // Ensure the config object reflects isActive: true for startBot
                    const updatedConfig = { ...config, isActive: true };
                    await this.startBot(updatedConfig); // startBot handles cold/warm start
                    results.successful.push({ id: config.id, name: config.botName });
                }
                catch (error) {
                    console.error(`Failed to start bot ${config.id} (${config.botName}) in memory:`, error);
                    // Attempt recovery for this specific bot
                    await this.forceCleanupBot(config.id); // This will set isActive: false in DB
                    results.failed.push({
                        id: config.id,
                        name: config.botName,
                        error: error instanceof Error ? error.message : 'Unknown error during in-memory start'
                    });
                }
            }
            const startCount = results.successful.length;
            console.log(`Server ${serverId} bots started: ${startCount}/${botConfigsToStart.length} bots processed.`);
            return { count: startCount, results };
        }
        catch (error) {
            console.error(`Failed to start all bots for server ${serverId}:`, error);
            // If the batch DB update failed, or another top-level error
            const botConfigsToAttemptCleanup = (await db.botConfiguration.findMany({
                where: { homeServerId: serverId, id: { in: results.failed.map(f => f.id) } // or all potential ones
                }
            }));
            for (const config of botConfigsToAttemptCleanup) {
                try {
                    await this.forceCleanupBot(config.id);
                }
                catch (cleanupError) {
                    console.error(`Error during force cleanup for ${config.id} after startAllServerBots failure: ${cleanupError}`);
                }
            }
            // Adjust successful count
            results.successful = results.successful.filter(s => !results.failed.some(f => f.id === s.id));
            return { count: results.successful.length, results }; // Return whatever partial success/failure we have
        }
    }
}
//# sourceMappingURL=botService.js.map