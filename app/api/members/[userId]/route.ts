import { db } from "@/lib/db/db";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { NextResponse } from "next/server";

export async function PATCH(req:Request, 
    { params }: { params: { userId: string}}
) {
    try {
        const user = await currentUser();
        const { searchParams } = new URL(req.url);
        const { role } = await req.json();
        const serverId = searchParams.get('serverId')

        if (!user) return new NextResponse('Unauthorized', { status: 401 });
        
        if (!serverId) return new NextResponse('Missing Server ID', {status: 400});

        if (!params.userId) return new NextResponse('Missing User ID', {status: 400});

        const server = await db.server.update({
            where: {
                id: serverId,
                userId: user.id,
            }, 
            data: {
                members: {
                    update: {
                        where: {
                            id: params.userId,
                            userId: {
                                not: user.id
                            }
                        },
                        data: {
                            role
                        }
                    }
                }
            },
            include: {
                members: {
                    include: {
                        user: true
                    },
                    orderBy: {
                        role: 'asc'
                    }
                }
            }
        });
        return NextResponse.json(server);
    } catch (error) {
        console.log('USER ID PATCH ERROR');
        return new NextResponse('Internal Error', { status: 500 })
    }
}