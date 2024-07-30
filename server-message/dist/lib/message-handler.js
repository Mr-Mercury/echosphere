import { db } from "./messageDbConnection.js";
//@ts-ignore
async function messageHandler(userId, serverId, channelId, fileUrl, content) {
    // Save to DB
    const server = db.server.findFirst({
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
    const channel = db.channel.findFirst({
        where: {
            id: channelId,
            serverId: serverId,
        }
    });
    if (!channel)
        return { status: 404, error: 'Message Handler Error: Channel not found!' };
    //@ts-ignore
    const member = server.members.find((member) => member.userId);
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
    // Send back response with message
}
export default messageHandler;
//# sourceMappingURL=message-handler.js.map