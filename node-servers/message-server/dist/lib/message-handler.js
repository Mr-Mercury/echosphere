import { MemberRole } from "@prisma/client";
import { db } from "./messageDbConnection.js";
export async function messagePostHandler(params) {
    const { type } = params;
    if (type === 'channel') {
        return channelPostHandler(params);
    }
    else if (type === 'dm') {
        return dmPostHandler(params);
    }
    return { status: 400, error: 'Invalid message type!' };
}
async function channelPostHandler(params) {
    const { userId, serverId, channelId, fileUrl, content } = params;
    const server = await db.server.findFirst({
        where: {
            id: serverId,
            members: {
                some: {
                    userId: userId,
                }
            }
        },
        include: {
            members: true,
        }
    });
    if (!server)
        return { status: 404, message: 'Message Handler Error: Server not found!' };
    const channel = await db.channel.findFirst({
        where: {
            id: channelId,
            serverId: serverId,
        }
    });
    if (!channel)
        return { status: 404, error: 'Message Handler Error: Channel not found!' };
    const member = server.members.find((member) => member.userId === userId);
    if (!member)
        return { status: 404, error: "Message Handler Error: User not found in Member list!" };
    const message = await db.message.create({
        data: {
            content,
            fileUrl,
            channelId: channelId,
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
    return { status: 200, message };
}
async function dmPostHandler(params) {
    const { userId, conversationId, fileUrl, content } = params;
    console.log('DM Post Handler params:', {
        userId,
        conversationId,
        hasFileUrl: !!fileUrl,
        hasContent: !!content
    });
    if (!conversationId)
        return { status: 400, error: 'Conversation ID missing!' };
    if (!content && !fileUrl)
        return { status: 400, error: 'No content or file URL provided!' };
    const conversation = await db.conversation.findFirst({
        where: {
            id: conversationId,
            OR: [
                { memberOneId: userId },
                { memberTwoId: userId },
            ]
        },
        include: {
            memberOne: {
                include: {
                    user: true,
                }
            },
            memberTwo: {
                include: {
                    user: true,
                }
            },
        }
    });
    console.log('Found conversation:', conversation ? {
        id: conversation.id,
        memberOneId: conversation.memberOneId,
        memberTwoId: conversation.memberTwoId
    } : null);
    if (!conversation)
        return { status: 404, error: 'Conversation not found!' };
    const member = conversation?.memberOne.userId === userId ?
        conversation.memberOne : conversation.memberTwo;
    const message = await db.dm.create({
        data: {
            content,
            fileUrl,
            conversationId: conversationId,
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
    return { status: 200, message };
}
export async function messageEditHandler(params) {
    const { userId, messageId, serverId, channelId, content, method } = params;
    try {
        const server = await db.server.findFirst({
            where: {
                id: serverId,
                members: {
                    some: {
                        userId: userId,
                    }
                }
            },
            include: {
                members: true,
            }
        });
        if (!server) {
            return { status: 404, error: 'Server not found!' };
        }
        const channel = await db.channel.findFirst({
            where: {
                id: channelId,
                serverId: serverId,
            },
        });
        if (!channel) {
            return { status: 404, error: 'Channel not found!' };
        }
        ;
        const member = server.members.find((member) => member.userId === userId);
        if (!member) {
            return { status: 404, error: 'Member not found!' };
        }
        let message = await db.message.findFirst({
            where: {
                id: messageId,
                channelId: channelId,
            },
            include: {
                member: {
                    include: {
                        user: true,
                    }
                }
            }
        });
        if (!message || message.deleted) {
            return { status: 404, error: 'Message not found!' };
        }
        const isMessageOwner = message.memberId === member.id;
        const isAdmin = member.role === MemberRole.ADMIN;
        const isModerator = member.role === MemberRole.MODERATOR;
        const canModify = isMessageOwner || isAdmin || isModerator;
        if (!canModify) {
            return { status: 401, error: 'Unauthorized!' };
        }
        ;
        if (method === 'DELETE') {
            message = await db.message.update({
                where: {
                    id: messageId,
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
            });
            // Note to self - tanstack requires you to return the updateKey to trigger rerenders/updates
            const updateKey = `chat:${channelId}:messages:update`;
            return { status: 200, updateKey, message };
        }
        if (method === 'EDIT') {
            if (!isMessageOwner)
                return { status: 401, error: 'Unauthorized to edit message!' };
            message = await db.message.update({
                where: {
                    id: messageId,
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
            });
            const updateKey = `chat:${channelId}:messages:update`;
            return { status: 200, updateKey, message };
        }
        return { status: 400, error: 'Invalid method' };
    }
    catch (error) {
        console.log('EDIT MESSAGE HANDLER ERROR', error);
        return { status: 500, error: 'Internal server error' };
    }
}
//# sourceMappingURL=message-handler.js.map