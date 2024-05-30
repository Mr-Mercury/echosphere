import { db } from "@/lib/db/db";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { NextResponse } from "next/server";

export async function DELETE (
    req: Request,
    { params }: { params: { serverId: string } }
) {
    try {
        const user = await currentUser();

        if (!user) return new NextResponse('Unauthorized user', {status: 401});

        const server = await db.server.delete({
            where: {
                id: params.serverId,
                userId: user.id,
            }, 
        })

        return NextResponse.json(server);
    } catch (error) {
        console.log('SERVER ID DELETE ERROR', error)
        return new NextResponse('Internal Error', {status: 500})
    }
}