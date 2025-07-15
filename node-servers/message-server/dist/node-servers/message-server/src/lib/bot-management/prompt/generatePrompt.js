// TODO: Add LONG TERM/SHORT TERM MEMORY here 
export function generatePrompt(recentMessages, channelName) {
    const topic = `The chatroom and topic for this discussion is ${channelName}, the recent messages in reverse order are: `;
    const messageHistory = [...recentMessages]
        .reverse()
        .map(message => `${message.member.user.username}: ${message.content}`)
        .join('\n');
    return topic + messageHistory;
}
//# sourceMappingURL=generatePrompt.js.map