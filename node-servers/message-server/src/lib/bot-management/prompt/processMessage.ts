import crypto from 'crypto';
import type { ProcessedMessage } from '../../entities/message-handler-types.js';

export function processMessage(message: string, botName: string, botUserId: string, modelName?: string): ProcessedMessage {
    return {
        content: message,
        botName: botName,
        botUserId: botUserId,
        modelName: modelName || 'Unknown Model' // Ensure modelName is always a string
    };
}