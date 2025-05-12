import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const user = await currentUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, description, systemPrompt, botConfigId } = await req.json();
        
        
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}