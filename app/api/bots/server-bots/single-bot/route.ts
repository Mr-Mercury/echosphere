import { db } from "@/lib/db/db";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
    try {
        const user = await currentUser();
        if (!user) return new NextResponse('Unauthorized', { status: 401 });

        // Implementation for updating server bots
        
    } catch (error) {
        console.log(error);
        return new NextResponse('Internal Server Bot Update Error', { status: 500 });
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
        
        // Get a specific server bot by ID
        const botConfig = await db.botConfiguration.findUnique({
            where: {
                botUserId: id
            },
            include: {
                botUser: true
            }
        });
        
        if (!botConfig) {
            return new NextResponse('Server bot not found', { status: 404 });
        }
        
        return NextResponse.json(botConfig);
    } catch (error) {
        console.log(error);
        return new NextResponse('Failed to fetch server bot data', { status: 500 });
    }
}