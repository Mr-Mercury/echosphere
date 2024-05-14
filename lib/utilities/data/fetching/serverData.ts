import { db } from "@/lib/db/db"

export const getServerById = async (serverId:string, userId:string) => {
    
    const server = await db.server.findUnique({
        where: {
            id: serverId,
            members: {
                some: {
                    userId
                }
            }
        }
    });

    return server;
}