import { db } from "@/lib/db/db";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { NextResponse } from "next/server";

export async function PATCH(req:Request, 
    { params }: { params: { memberId: string}}
) {
    try {
        const user = await currentUser();
        if (!user) return new NextResponse('Unauthorized', { status: 401 });

        const memberId = params.memberId;
        if (!memberId) return new NextResponse('Missing Member ID', {status: 400});

        const { searchParams } = new URL(req.url);
        const serverId = searchParams.get('serverId');
        if (!serverId) return new NextResponse('Missing Server ID', {status: 400});

        const { role } = await req.json();

        const server = await db.server.update({
            where: {
                id: serverId,
                userId: user.id,
            }, 
            data: {
                members: {
                    update: {
                        where: {
                            id: memberId,
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

export async function DELETE(
    req: Request, 
    {params}: { params: {memberId:string }}
) {
    try {
        const user = await currentUser();
        if (!user) return new NextResponse('Unauthorized!', {status: 401});

        const { searchParams } = new URL(req.url);
        const serverId = searchParams.get('serverId');
        if (!serverId) return new NextResponse('Missing Server Id!', {status: 400});

        if (!params.memberId) return new NextResponse('Missing Member ID!', {status: 400});

        const server = await db.server.update({
            where: {
                id: serverId,
                userId: user.id,
            },
            data: {
                members: {
                    deleteMany: {
                        id: params.memberId,
                        userId: {
                            not: user.id
                        }
                    }
                }
            },
            include: {
                members: {
                    include: {
                        user: true,
                    },
                    orderBy: {
                        role: 'asc'
                    }
                }
            }
        });

        return NextResponse.json(server);
    } catch (error) {
        console.log('MEMBER ID DELETE ERROR');
        return new NextResponse('Internal Error', {status: 500});
    }
}