import { db } from "@/lib/db/db";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const user = await currentUser();
        
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const servers = await db.server.findMany({
            where: {
                members: {
                    some: {
                        userId: user.id,
                        role: {
                            in: [MemberRole.ADMIN, MemberRole.MODERATOR]
                        }
                    }
                }
            },
            include: {
                members: {
                    where: {
                        userId: user.id
                    },
                    select: {
                        role: true
                    }
                }
            }
        });

        return NextResponse.json(servers);
    } catch (error) {
        console.log('FETCH ADMIN SERVERS ERROR', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
} 