export function processMessage(message, botName, botUserId, modelName) {
    return {
        content: message,
        botName: botName,
        botUserId: botUserId,
        modelName: modelName || 'Unknown Model' // Ensure modelName is always a string
    };
}
//# sourceMappingURL=processMessage.js.map