import { db } from "@/lib/db/db";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { NextResponse } from "next/server"

export async function PATCH (
    req: Request,
    { params }: { params: { serverId: string }}
) {
    try {
        const user = await currentUser();

        if(!user) return new NextResponse('Unauthorized!', {status: 401})

        if(!params.serverId) return new NextResponse('ServerID missing', { status: 400})
        //As usual, checking for userId to ensure admin can't leave the server must delete server)
        const server = await db.server.update({
            where: {
                id: params.serverId,
                userId: {
                    not: user.id
                },
                members: {
                    some: {
                        userId: user.id
                    }
                }
            },
            data: {
                members: {
                    deleteMany: {
                        userId: user.id,
                    }
                }
            }
        });

        return NextResponse.json(server);
    } catch(error) {
        console.log('SERVER ID LEAVE ERROR')
        return new NextResponse('Internal error', {status: 500});
    }
}