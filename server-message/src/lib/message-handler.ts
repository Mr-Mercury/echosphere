import { db } from "./messageDbConnection.js";

//@ts-ignore
async function messageHandler( userId, serverId, channelId, content) {
    // Save to DB
    const server = db.server.findFirst({
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
    // Send back response with message
}

export default messageHandler;