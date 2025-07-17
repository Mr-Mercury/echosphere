// TODO: Add LONG TERM/SHORT TERM MEMORY here 
export function generatePrompt(recentMessages, channelName) {
    console.log(`generatePrompt called with ${recentMessages.length} messages for channel: ${channelName}`);
    const topic = `The chatroom and topic for this discussion is ${channelName}, the recent messages in reverse order are: `;
    const messageHistory = [...recentMessages]
        .reverse()
        .map(message => {
        console.log(`Message from ${message.member.user.username}: ${message.content.substring(0, 50)}...`);
        return `${message.member.user.username}: ${message.content}`;
    })
        .join('\n');
    const fullPrompt = topic + messageHistory;
    console.log(`Full prompt generated (${fullPrompt.length} chars):`, fullPrompt);
    return fullPrompt;
}
//# sourceMappingURL=generatePrompt.js.map