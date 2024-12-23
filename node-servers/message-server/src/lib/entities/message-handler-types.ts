import { Message, User, Member } from "@prisma/client";


interface MemberWithUser extends Member {
    user: User;
}

interface MessageWithMember extends Message {
    member: MemberWithUser;
}
export type MessagePostHandlerParams = {
    userId: string;
    serverId: string | null;
    channelId: string | null;
    conversationId: string | null;
    fileUrl: string | null;
    content: string;
    type: 'channel' | 'dm';
}

export type ChannelPostHandlerParams = Omit<MessagePostHandlerParams, 'type' | 'serverId' | 'channelId' | 'conversationId'> & {
    type: 'channel';
    serverId: string;
    channelId: string;
    conversationId: null;
}

export type DmPostHandlerParams = Omit<MessagePostHandlerParams, 'type' | 'serverId' | 'channelId' | 'conversationId'> & {
    type: 'dm';
    serverId: null;
    channelId: null;
    conversationId: string;
}

// TODO - remove nulls from userId
export type MessageEditHandlerParams = {
    userId: string;
    messageId: string;
    serverId: string | null;
    channelId: string | null;
    conversationId: string | null;
    content: string;
    type: string;
    method: 'DELETE' | 'EDIT';
}

export type ChannelEditHandlerParams = Omit<MessageEditHandlerParams, 'type' | 'serverId' | 'channelId'> & {
    type: 'channel';
    serverId: string;
    channelId: string;
    conversationId: null;
}

export type DmEditHandlerParams = Omit<MessageEditHandlerParams, 'type' | 'serverId' | 'channelId'> & {
    type: 'dm';
    serverId: null;
    channelId: null;
    conversationId: string;
}

export interface MessageResponse {
    status: number;
    message?: MessageWithMember;
    error?: string;
}

export interface MessageUpdateResponse {
    status?: number;
    updateKey?: string;
    message?: MessageWithMember;
    error?: string;
}

