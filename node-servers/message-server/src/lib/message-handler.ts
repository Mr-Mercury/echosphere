import { MemberRole } from "@prisma/client";
import { db } from "./messageDbConnection.js";
import { MessagePostHandlerParams, MessageEditHandlerParams,
    MessageResponse, MessageUpdateResponse } from "./entities/message-handler-types.js";


export async function messagePostHandler( 
    params: MessagePostHandlerParams) 
{
    const { userId, serverId, channelId, fileUrl, content } = params;
    // Save to DB
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

    const member = server.members.find((member) => member.userId);

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
    // Send back response with message
}

export async function messageEditHandler ( 
    {userId, messageId, serverId, channelId, content, method}: MessageEditHandlerParams
    ) 
{
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
        }

        const updateKey = `chat:${channelId}:messages:update`;

        return {updateKey, message};
    } catch (error) {
        console.log('EDIT MESSAGE HANDLER ERROR', error);
    }
}