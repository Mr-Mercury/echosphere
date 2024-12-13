import { db } from "@/lib/db/db";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { Dm } from "@prisma/client";
import { NextResponse } from "next/server";

const NUMBER_OF_MESSAGES = 10;

export async function GET(
    req: Request
) {
    try {
        const user = await currentUser();
        const { searchParams } = new URL(req.url);

        const cursor = searchParams.get('cursor');
        const conversationId = searchParams.get('conversationId');
        
        if (!user) return new NextResponse('Unauthorized', {status: 401});
        if (!conversationId) return new NextResponse('Conversation ID missing!', {status: 400});

        let messages: Dm[] = [];

        if (cursor) {
            messages = await db.dm.findMany({
                take: NUMBER_OF_MESSAGES,
                skip: 1,
                cursor: {
                    id: cursor,
                },
                where: {
                    conversationId,
                },
                include: {
                    member: {
                        include: {
                            user: true,
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc',
                }
            })
        } else {
            messages = await db.dm.findMany({
                take: NUMBER_OF_MESSAGES,
                where: {
                    conversationId,
                },
                include: {
                    member: {
                        include: {
                            user: true,
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc',
                }
            })
        }

        let nextCursor = null;

        if (messages.length === NUMBER_OF_MESSAGES) {
            nextCursor = messages[NUMBER_OF_MESSAGES - 1].id;
        };

        return NextResponse.json({
            items: messages,
            nextCursor
        })

    } catch (error) {
        return new NextResponse('Interal Error', {status: 500})
    }
}