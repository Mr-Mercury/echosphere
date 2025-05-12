import { db } from "@/lib/db/db";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const user = await currentUser();
        if (!user) return new NextResponse('Unauthorized', { status: 401 });
        
        const url = new URL(req.url);
        const id = url.searchParams.get('id');
        
        if (!id) {
            return new NextResponse('Missing template ID', { status: 400 });
        }
        
        // Get a specific bot template by ID
        const template = await db.botTemplate.findUnique({
            where: {
                id: id
            }
        });
        
        if (!template) {
            return new NextResponse('Bot template not found', { status: 404 });
        }
        
        // Return the template
        return NextResponse.json(template);
    } catch (error) {
        console.log(error);
        return new NextResponse('Failed to fetch bot template data', { status: 500 });
    }
} 