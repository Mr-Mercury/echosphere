

export type MessagePostHandlerParams = {
    userId: string;
    serverId: string;
    channelId: string;
    fileUrl: string | null;
    content: string;
}

export type MessageEditHandlerParams = {
    userId: string;
    messageId: string;
    serverId: string;
    channelId: string;
    content: string;
    method: 'DELETE' | 'EDIT';
}
