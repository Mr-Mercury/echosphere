import { MessageData } from "../../entities/message-handler-types.js";
import { BotConfiguration } from "../../entities/bot-types.js";

// TODO: Add LONG TERM/SHORT TERM MEMORY here 
export function generatePrompt(config: BotConfiguration, recentMessages: MessageData[]) {
    const finalPrompt = config.prompt + '\n\n' + recentMessages.map(message => `${message.member.user.username}: ${message.content}`).join('\n');
    return finalPrompt;
}