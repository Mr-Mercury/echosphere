import { db } from "@/lib/db/db";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { NextResponse } from "next/server";

export async function PATCH (
    req: Request,
    { params }: { params: { serverId: string } }
) {
    try {
        const user = await currentUser();
        const { name, imageUrl } = await req.json();

        if (!user) return new NextResponse('Unauthorized user', {status: 401});

        const server = await db.server.update({
            where: {
                id: params.serverId,
                userId: user.id,
            }, 
            data: {
                name, imageUrl,
            }
        })

        return NextResponse.json(server);
    } catch (error) {
        console.log('SERVER ID PATCH ERROR', error)
        return new NextResponse('Internal Error', {status: 500})
    }
}