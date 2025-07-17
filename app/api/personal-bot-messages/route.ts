import { db } from "@/lib/db/db";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { NextResponse } from "next/server";
import { PersonalBotMessage } from "@prisma/client";

const MESSAGES_BATCH = 10;

export async function GET(req: Request) {
    try {
        const user = await currentUser();
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const cursor = searchParams.get("cursor");
        const conversationId = searchParams.get("conversationId");

        if (!conversationId) {
            return new NextResponse("Conversation ID missing", { status: 400 });
        }

        let messages: PersonalBotMessage[] = [];

        if (cursor) {
            messages = await db.personalBotMessage.findMany({
                take: MESSAGES_BATCH,
                skip: 1,
                cursor: {
                    id: cursor,
                },
                where: {
                    conversationId,
                },
                orderBy: {
                    createdAt: "desc",
                }
            });
        } else {
            messages = await db.personalBotMessage.findMany({
                take: MESSAGES_BATCH,
                where: {
                    conversationId,
                },
                orderBy: {
                    createdAt: "desc",
                }
            });
        }

        let nextCursor = null;

        if (messages.length === MESSAGES_BATCH) {
            nextCursor = messages[MESSAGES_BATCH - 1].id;
        }

        return NextResponse.json({
            items: messages,
            nextCursor
        });

    } catch (error) {
        console.log("[PERSONAL_BOT_MESSAGES_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
} 