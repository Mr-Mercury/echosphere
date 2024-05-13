import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { v4 } from "uuid";
import { db } from "@/lib/db/db";
import { NextResponse } from "next/server";
import { MemberRole } from "@prisma/client";

export async function POST(req: Request) {
    try{
        const { name, imageUrl } = await req.json();
        const user = await currentUser();

        if (!user) return new NextResponse('Unauthorized', {status: 401});

        const server = await db.server.create({
            data: {
                userId: user.id,
                name,
                imageUrl,
                inviteCode: v4(),
                channels: {
                    create: [
                        { name: 'general', userId: user.id}
                    ]
                },
                members: {
                    create: [
                        {userId: user.id, role: MemberRole.ADMIN}
                    ]
                }
            }
        });

        return NextResponse.json(server);
        
    } catch (error) {
        console.log('!!!SERVER POST ERROR!!!', error);
        return new NextResponse('Internal Error', {status: 500});
    }
}