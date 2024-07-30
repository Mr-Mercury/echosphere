import { db } from "@/lib/db/db";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { Message } from "@prisma/client";
import { NextResponse } from "next/server";


//TODO: CHANGE THIS TO BE HIGHER AFTER TESTING
const NUMBER_OF_MESSAGES = 10;

export async function GET(
    req: Request
) {
    try {
        const user = await currentUser();
        const { searchParams } = new URL(req.url);

        const cursor = searchParams.get('cursor');
        const channelId = searchParams.get('channelId');
        
        if (!user) return new NextResponse('Unauthorized', {status: 401});
        if (!channelId) return new NextResponse('Channel ID missing!', {status: 400});

        let messages: Message[] = [];

        if (cursor) {
            messages = await db.message.findMany({
                take: NUMBER_OF_MESSAGES,
                skip: 1,
                cursor: {
                    id: cursor,
                },
                where: {
                    channelId,
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
            messages = await db.message.findMany({
                take: NUMBER_OF_MESSAGES,
                where: {
                    channelId,
                },
                include: {
                    member: {
                        include: {
                            user: true,
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc';
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
        console.log('MESSAGES GET ERROR: ', error);
        return new NextResponse('Interal Error', {status: 500})
    }
}