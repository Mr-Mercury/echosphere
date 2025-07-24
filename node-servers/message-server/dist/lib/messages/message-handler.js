import { MemberRole } from "@prisma/client";
import { db } from "./messageDbConnection.js";
export async function messagePostHandler(params) {
    const { type } = params;
    if (type === 'channel') {
        return channelPostHandler(params);
    }
    else if (type === 'personalBotDm') {
        return personalBotDmPostHandler(params);
    }
    else if (type === 'userDm') {
        return userDmPostHandler(params);
    }
    return { status: 400, error: 'Invalid message type!' };
}
async function channelPostHandler(params) {
    const { userId, serverId, channelId, fileUrl, content, modelName } = params;
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
            modelName,
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
async function personalBotDmPostHandler(params) {
    const { userId, conversationId, fileUrl, content } = params;
    console.log("Personal bot DM handler hit with params:", params);
    // TODO: Implement the logic for handling personal bot DMs
    // 1. Save user message to PersonalBotMessage table
    // 2. Trigger bot response generation
    // 3. Save bot message to PersonalBotMessage table
    // 4. Return a response (or handle socket emission elsewhere)
    return { status: 200, message: "Handler hit successfully" };
}
async function userDmPostHandler(params) {
    const { userId, conversationId, fileUrl, content } = params;
    if (!conversationId)
        return { status: 400, error: 'Conversation ID missing!' };
    if (!content && !fileUrl)
        return { status: 400, error: 'No content or file URL provided!' };
    // Verify the conversation exists and user has access
    const conversation = await db.userConversation.findFirst({
        where: {
            id: conversationId,
            OR: [
                { userOneId: userId },
                { userTwoId: userId }
            ]
        },
        include: {
            userOne: true,
            userTwo: true,
        }
    });
    if (!conversation)
        return { status: 404, error: 'Conversation not found!' };
    // Create the message in the UserDm table
    const message = await db.userDm.create({
        data: {
            content,
            fileUrl,
            conversationId: conversationId,
            userId: userId,
        },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    image: true,
                    human: true
                }
            }
        }
    });
    // Update conversation timestamp
    await db.userConversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() }
    });
    return { status: 200, message };
}
export async function messageEditHandler(params) {
    const { type } = params;
    if (type === 'channel') {
        return channelEditHandler(params);
    }
    else if (type === 'userDm') {
        return userDmEditHandler(params);
    }
    else if (type === 'personalBotDm') {
        return personalBotDmEditHandler(params);
    }
    return { status: 400, error: 'Invalid message type for editing' };
}
async function channelEditHandler(params) {
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
            return { status: 200, message };
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
            return { status: 200, message };
        }
        return { status: 400, error: 'Invalid method' };
    }
    catch (error) {
        console.log('EDIT CHANNEL MESSAGE HANDLER ERROR', error);
        return { status: 500, error: 'Internal server error' };
    }
}
async function userDmEditHandler(params) {
    // TODO: Implement userDm edit handler
    return { status: 501, error: 'User DM editing not implemented yet' };
}
async function personalBotDmEditHandler(params) {
    // TODO: Implement personalBotDm edit handler  
    return { status: 501, error: 'Personal bot DM editing not implemented yet' };
}
//# sourceMappingURL=message-handler.js.map