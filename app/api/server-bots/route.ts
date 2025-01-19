import { db } from "@/lib/db/db";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
    try {
        const user = await currentUser();
        if (!user) return new NextResponse('Unauthorized', { status: 401 });

        
    } catch (error) {
        console.log(error);
        return new NextResponse('Internal Chat Bot Creation Error', { status: 500 });
    }
}