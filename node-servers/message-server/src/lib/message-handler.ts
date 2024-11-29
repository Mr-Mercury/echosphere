import { MemberRole } from "@prisma/client";
import { db } from "./messageDbConnection.js";
import { MessagePostHandlerParams, MessageEditHandlerParams,
    MessageResponse, MessageUpdateResponse, ChannelPostHandlerParams, DmPostHandlerParams } from "./entities/message-handler-types.js";



export async function messagePostHandler( 
    params: MessagePostHandlerParams) 
{
    const { type } = params;
    
    if (type === 'channel') {
        return channelPostHandler(params as ChannelPostHandlerParams);
    } else if (type === 'dm') {
        return dmPostHandler(params as DmPostHandlerParams);
    }

    return { status: 400, error: 'Invalid message type!'};
}

async function channelPostHandler(params: ChannelPostHandlerParams) {
    const { userId, serverId, channelId, fileUrl, content } = params;

    const server = await db.server.findFirst({
        where: {
            id: serverId as string,
            members: {
                some: {
                    userId: userId,
                }
            }
        },
        include: {
            members: true,
        }
    })

    if (!server) return {status: 404, message: 'Message Handler Error: Server not found!'};

    const channel = await db.channel.findFirst({
        where: {
            id: channelId as string,
            serverId: serverId as string,
        }
    })

    if (!channel) return {status: 404, error: 'Message Handler Error: Channel not found!'};

    const member = server.members.find((member) => member.userId === userId);

    if (!member) return {status: 404, error: "Message Handler Error: User not found in Member list!"};

    const message = await db.message.create({
        data: {
            content,
            fileUrl,
            channelId: channelId as string,
            memberId: member.id,
        },
        include: {
            member: {
                include: {
                    user: true,
                }
            }
        }
    });

    return {status: 200, message}
}

async function dmPostHandler(params: DmPostHandlerParams) {
    const { userId, conversationId, fileUrl, content } = params;
    
}

export async function messageEditHandler ( 
        params: MessageEditHandlerParams
    ) 
{
    const { userId, messageId, serverId, channelId, content, method } = params;
     
    try {
        const server = await db.server.findFirst({
            where: {
                id: serverId as string,
                members: {
                    some: {
                        userId: userId,
                    }
                }
            },
            include: {
                members: true,
            }
        })

        if (!server) {
            return {status: 404, error: 'Server not found!'}
        }

        const channel = await db.channel.findFirst({
            where: {
                id: channelId as string,
                serverId: serverId as string,
            },
        });

        if (!channel) {
            return {status: 404, error: 'Channel not found!'}
        };

        const member = server.members.find((member) => member.userId === userId);

        if (!member) {
            return {status: 404, error: 'Member not found!'};
        }

        let message = await db.message.findFirst({
            where: {
                id: messageId as string,
                channelId: channelId as string,
            },
            include: {
                member: {
                    include: {
                        user: true,
                    }
                }
            }
        })

        if (!message || message.deleted) {
            return {status: 404, error: 'Message not found!'};
        }

        const isMessageOwner = message.memberId === member.id;
        const isAdmin = member.role === MemberRole.ADMIN;
        const isModerator = member.role === MemberRole.MODERATOR;
        const canModify = isMessageOwner || isAdmin || isModerator;

        if (!canModify) {
            return {status: 401, error: 'Unauthorized!'}
        };

        if (method === 'DELETE') {
            message = await db.message.update({
                where: {
                    id: messageId as string,
                }, 
                data: {
                    fileUrl: null,
                    content: 'This message has been deleted',
                    deleted: true,
                },
                include: {
                    member: {
                        include: {
                            user: true,
                        }
                    }
                }
            })
            // Note to self - tanstack requires you to return the updateKey to trigger rerenders/updates
            const updateKey = `chat:${channelId}:messages:update`;
            return {status: 200, updateKey, message};
        }

        if (method === 'EDIT') {
            if (!isMessageOwner) return {status: 401, error: 'Unauthorized to edit message!'};

            message = await db.message.update({
                where: {
                    id: messageId as string,
                }, 
                data: {
                    content,
                },
                include: {
                    member: {
                        include: {
                            user: true,
                        }
                    }
                }
            })

            const updateKey = `chat:${channelId}:messages:update`;
            return {status: 200, updateKey, message};
        }

        return {status: 400, error: 'Invalid method'};
    } catch (error) {
        console.log('EDIT MESSAGE HANDLER ERROR', error);
        return {status: 500, error: 'Internal server error'};
    }
}