import crypto from 'crypto';
export function processMessage(message, botName, botUserId, modelName) {
    return {
        id: crypto.randomUUID(), // Generate a unique ID
        content: message,
        fileUrl: null,
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        modelName,
        member: {
            id: botUserId, // Using botUserId as a placeholder for member ID
            user: {
                id: botUserId, // Correctly use botUserId
                username: botName, // Use botName for the username
                human: false
            }
        }
    };
}
//# sourceMappingURL=processMessage.js.map