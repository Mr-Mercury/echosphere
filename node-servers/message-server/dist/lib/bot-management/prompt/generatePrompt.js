// TODO: Add LONG TERM/SHORT TERM MEMORY here 
export function generatePrompt(recentMessages, channelName) {
    const topic = `The chatroom and topic for this discussion is ${channelName}, the recent messages are: `;
    const messageHistory = recentMessages.map(message => `${message.member.user.username}: ${message.content}`).join('\n');
    return topic + messageHistory;
}
//# sourceMappingURL=generatePrompt.js.map