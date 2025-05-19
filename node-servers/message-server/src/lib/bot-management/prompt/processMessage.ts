import crypto from 'crypto';

export function processMessage(message: string, botName: string, botUserId: string, modelName?: string) {
    return {
        id: crypto.randomUUID(), // Generate a unique ID
        content: message,
        fileUrl: null,
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        modelName,
        member: { // This member structure is a simplified representation
            id: botUserId, // Using botUserId as a placeholder for member ID
            user: {
                id: botUserId, // Correctly use botUserId
                username: botName, // Use botName for the username
                human: false
            }
        }
    };
}