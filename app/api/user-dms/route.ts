import { db } from "@/lib/db/db";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { UserDm } from "@prisma/client";
import { NextResponse } from "next/server";

const NUMBER_OF_MESSAGES = 10;

export async function GET(req: Request) {
    try {
        const user = await currentUser();
        const { searchParams } = new URL(req.url);

        const cursor = searchParams.get('cursor');
        const conversationId = searchParams.get('conversationId');
        
        if (!user) return new NextResponse('Unauthorized', {status: 401});
        if (!conversationId) return new NextResponse('Conversation ID missing!', {status: 400});

        const conversation = await db.userConversation.findFirst({
            where: {
                id: conversationId,
                OR: [
                    { userOneId: user.id },
                    { userTwoId: user.id }
                ]
            }
        });

        if (!conversation) {
            return new NextResponse('Conversation not found or access denied', {status: 404});
        }

        let messages: UserDm[] = [];

        if (cursor) {
            messages = await db.userDm.findMany({
                take: NUMBER_OF_MESSAGES,
                skip: 1,
                cursor: {
                    id: cursor,
                },
                where: {
                    conversationId,
                    deleted: false
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            image: true,
                            human: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc',
                }
            })
        } else {
            messages = await db.userDm.findMany({
                take: NUMBER_OF_MESSAGES,
                where: {
                    conversationId,
                    deleted: false
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            image: true,
                            human: true
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
        }

        return NextResponse.json({
            items: messages,
            nextCursor
        });

    } catch (error) {
        console.log('[USER_DMS_GET]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
} 