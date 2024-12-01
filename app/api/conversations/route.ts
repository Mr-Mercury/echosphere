import { db } from "@/lib/db/db";
import { NextResponse } from "next/server";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { User } from "@prisma/client";

export async function GET(req: Request) {
    const user = await currentUser();

    try { 

    } catch (error) {
        console.log(error);
        return new NextResponse('Conversation List Retrieval Failed!', {status: 500});
    }
}