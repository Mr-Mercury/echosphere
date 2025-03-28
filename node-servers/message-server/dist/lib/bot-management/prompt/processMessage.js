export function processMessage(message, botName, modelName) {
    return {
        id: Date.now().toString(), // Generate a unique ID
        content: message,
        fileUrl: null,
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        modelName,
        member: {
            id: botName, // Using botName as member ID for now
            user: {
                id: botName,
                username: botName,
                human: false
            }
        }
    };
}
//# sourceMappingURL=processMessage.js.map