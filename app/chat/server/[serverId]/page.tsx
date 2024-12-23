import { db } from "@/lib/db/db";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { redirect } from "next/navigation";

interface ServerIdPageProps{
    params: {
        serverId: string;
    }
};

async function ServerPage({ params, }: ServerIdPageProps) {
    
    const user = await currentUser();

    if (! user) return redirect('/login');

    if (params.serverId === 'personal') {
        return null;
    }

    const server = await db.server.findUnique({
        where: {
            id: params.serverId,
            members: {
                some: {
                    userId: user.id,
                }
            }
        },
        include: {
            channels: {
                where: {
                    name: 'general'
                },
                orderBy: {
                    createdAt: 'asc'
                }
            }
        }
    })

    const landingChannel = server?.channels[0];

    if (landingChannel?.name !== 'general') {
        return null;
    }

    return redirect(`/chat/server/${params.serverId}/${landingChannel?.id}`);
}


export default ServerPage; 
