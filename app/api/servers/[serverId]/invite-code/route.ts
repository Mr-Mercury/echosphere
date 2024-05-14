import { db } from "@/lib/db/db";
import { v4 } from "uuid";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request,
    { params }: { params: { serverId: string } } 
) {
   try {
    const user = await currentUser();

    if (!user) return new NextResponse('Unauthorized user', {status: 401});
    if (!params.serverId) return new NextResponse('Server ID missing', {status: 400});

    const server = await db.server.update({
        where: {
            id: params.serverId,
            userId: user.id,
        },
        data: {
            inviteCode: v4(),
        },
    });

    return NextResponse.json(server);
   } catch (error) {
    console.log('SERVER ID ISSUE', error);
    return new NextResponse('Interal error', {status: 500})
   } 
}