import { db } from "@/lib/db/db";

export const getServerById = async (serverId: string, userId: string) => {
    
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

export const getServerChannelsById = async (serverId: string, userId: string) => {

    const server = await db.server.findUnique({
        where: {
            id: serverId,
        },
        include: {
            channels: {
                orderBy: {
                    createdAt: 'asc'
                },
            },
            members: {
                include: {
                    user: true,
                },
                orderBy: {
                    role: 'asc'
                }
            }
        }
    })
    
    return server;
}
