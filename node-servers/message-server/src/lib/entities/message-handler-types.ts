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
    type: 'channel' | 'personalBotDm' | 'userDm';
}

export type ChannelPostHandlerParams = Omit<MessagePostHandlerParams, 'type' | 'serverId' | 'channelId' | 'conversationId'> & {
    type: 'channel';
    serverId: string;
    channelId: string;
    conversationId: null;
    modelName: string | null;
}

export type PersonalBotDmPostHandlerParams = Omit<MessagePostHandlerParams, 'type' | 'serverId' | 'channelId'> & {
    type: 'personalBotDm';
    serverId: null;
    channelId: null;
    conversationId: string;
}

export type UserDmPostHandlerParams = Omit<MessagePostHandlerParams, 'type' | 'serverId' | 'channelId'> & {
    type: 'userDm';
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
    type: 'channel' | 'personalBotDm' | 'userDm';
    method: 'DELETE' | 'EDIT';
}

export type ChannelEditHandlerParams = Omit<MessageEditHandlerParams, 'type' | 'serverId' | 'channelId'> & {
    type: 'channel';
    serverId: string;
    channelId: string;
    conversationId: null;
}

export type PersonalBotDmEditHandlerParams = Omit<MessageEditHandlerParams, 'type' | 'serverId' | 'channelId'> & {
    type: 'personalBotDm';
    serverId: null;
    channelId: null;
    conversationId: string;
}

export type UserDmEditHandlerParams = Omit<MessageEditHandlerParams, 'type' | 'serverId' | 'channelId'> & {
    type: 'userDm';
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

export interface MessageData {
    id: string;
    content: string;
    fileUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    memberId: string;
    member: MemberWithUser;
}

export interface ProcessedMessage {
    content: string;
    botName: string;
    botUserId: string;
    modelName: string;
}