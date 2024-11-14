import { Message, User, Member } from "@prisma/client";


interface MemberWithUser extends Member {
    user: User;
}

interface MessageWithMember extends Message {
    member: MemberWithUser;
}
export type MessagePostHandlerParams = {
    userId: string;
    serverId: string;
    channelId: string;
    fileUrl: string | null;
    content: string;
}
// TODO - remove nulls from userId
export type MessageEditHandlerParams = {
    userId: string;
    messageId: string;
    serverId: string;
    channelId: string;
    content: string;
    method: 'DELETE' | 'EDIT';
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

