import { MessageData } from "../../entities/message-handler-types.js";
import { BotConfiguration } from "../../entities/bot-types.js";

// TODO: Add LONG TERM/SHORT TERM MEMORY here 
export function generatePrompt(recentMessages: MessageData[], channelName: string) {
    const topic = `The chatroom and topic for this discussion is ${channelName}, the recent messages are: `;
    const messageHistory = recentMessages.map(message => `${message.member.user.username}: ${message.content}`).join('\n');
    return topic + messageHistory;
}