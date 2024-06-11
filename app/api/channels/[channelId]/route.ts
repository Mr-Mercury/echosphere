import { db } from "@/lib/db/db";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function DELETE(
    req: Request,
    { params }: { params: {channelId: string} }
) {
    try {
        const user = await currentUser();
        if (!user) return new NextResponse('Unauthorized', {status: 401});

        const {searchParams} = new URL(req.url);
        const serverId = searchParams.get('serverId');

        if (!serverId) return new NextResponse('Server missing', {status: 400});

        if (!params.channelId) return new NextResponse('Channel Id Missing', {status: 400});
        
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
                    delete: {
                        id: params.channelId,
                        name: {
                            not: 'general',
                        }
                    }
                }
            }
        })

        return NextResponse.json(server);
    } catch (error) {
        console.log('[CHANNEL DELETE]', error);
        return new NextResponse('Internal Error', {status: 500})
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: {channelId: string} }
) {
    try {
        const user = await currentUser();
        if (!user) return new NextResponse('Unauthorized', {status: 401});

        const {searchParams} = new URL(req.url);
        const serverId = searchParams.get('serverId');

        if (!serverId) return new NextResponse('Server missing', {status: 400});

        if (!params.channelId) return new NextResponse('Channel Id Missing', {status: 400});

        const { name, type } = await req.json();

        if (name === 'general') return new NextResponse("You may not use 'general' for a name", {status: 400});
        

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
                    update: {
                        where: {
                            id: params.channelId,
                            NOT: {
                                name: 'general',
                            },
                        },
                        data: {
                            name,
                            type
                        }
                    }
                }
            }
        })
        
        return NextResponse.json(server);
    } catch (error) {
        console.log('[CHANNEL PATCH]', error);
        return new NextResponse('Internal Error', {status: 500})
    }
}