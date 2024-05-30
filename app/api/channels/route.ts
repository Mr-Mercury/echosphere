import { db } from "@/lib/db/db";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(
    req: Request
) {
    try {
        const user = await currentUser();
        if (!user) return new NextResponse('Unauthorized!', {status: 401});

        const {name, type} = await req.json();
        if (name === 'general') return new NextResponse("Stop screwing with the API.  Name can't be general", {status:400});
        
        const { searchParams } = new URL (req.url);

        const serverId = searchParams.get('serverId');
        if (!serverId) return new NextResponse('Missing Server ID!', {status: 400});

        const server = await db.server.update({
            where: {
                id: serverId,
                members: {
                    some: {
                        userId: user.id,
                        role: {
                            in: [MemberRole.ADMIN, MemberRole.MODERATOR]
                        }
                    }
                }
            },
            data: {
                channels: {
                    create: {
                        userId: user.id,
                        name,
                        type,
                    }
                }
            }
        })

        return NextResponse.json(server);

    } catch(error) {
        console.log('CHANNEL POST ERROR', error);
        return new NextResponse('Internal Error', {status: 500});
    }
}