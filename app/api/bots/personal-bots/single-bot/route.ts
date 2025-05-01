import { db } from "@/lib/db/db";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
    try {
        const user = await currentUser();
        if (!user) return new NextResponse('Unauthorized', { status: 401 });

        const url = new URL(req.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return new NextResponse('Missing bot ID', { status: 400 });
        }

        const personalBot = await db.personalBot.findUnique({
            where: {
                id,
                creatorId: user.id
            }
        });

        // Implementation for updating personal bots
        
    } catch (error) {
        console.log(error);
        return new NextResponse('Internal Personal Bot Update Error', { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const user = await currentUser();
        if (!user) return new NextResponse('Unauthorized', { status: 401 });

        const url = new URL(req.url);
        const id = url.searchParams.get('id');
        
        if (!id) {
            return new NextResponse('Missing bot ID', { status: 400 });
        }
        
        const personalBot = await db.personalBot.findUnique({
            where: {
                id,
                creatorId: user.id
            }
        });

        if (!personalBot) {
            return new NextResponse('Personal bot not found', { status: 404 });
        }

        return NextResponse.json(personalBot);
    } catch (error) {
        console.log(error);
        return new NextResponse('Failed to fetch personal bot data', { status: 500 });
    }
}