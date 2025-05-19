import { NextResponse } from "next/server";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { db } from "@/lib/db/db";
import { MemberRole } from "@prisma/client";

// Message server URL
const MESSAGE_SERVER_URL = process.env.MESSAGE_SERVER_URL || "http://localhost:4000";

export async function POST(req: Request) {
    try {
        const user = await currentUser();
        const { serverId } = await req.json();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!serverId) {
            return new NextResponse("Server ID is required", { status: 400 });
        }

        // Check if the user is a member of the server with adequate permissions
        const member = await db.member.findFirst({
            where: {
                userId: user.id,
                serverId,
                role: {
                    in: [MemberRole.ADMIN, MemberRole.MODERATOR]
                }
            }
        });

        if (!member) {
            return new NextResponse("You do not have permission to start bots on this server", { status: 403 });
        }

        // Call the message server to start all bots for this server
        const response = await fetch(`${MESSAGE_SERVER_URL}/bots/start-server`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ serverId })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Failed to start server bots:", errorData);
            return new NextResponse("Failed to start server bots", { status: response.status });
        }

        const result = await response.json();

        return NextResponse.json({
            message: `Successfully started ${result.count} bots on the server`,
            count: result.count,
            details: {
                successful: result.results.successful.length > 0 ? 
                    result.results.successful.map((bot: any) => bot.name) : [],
                failed: result.results.failed.length > 0 ? 
                    result.results.failed.map((bot: any) => ({ name: bot.name, reason: bot.error })) : []
            }
        });
    } catch (error) {
        console.error("[SERVER_START_ALL_BOTS_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
} 