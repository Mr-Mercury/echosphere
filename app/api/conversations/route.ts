import { db } from "@/lib/db/db";
import { NextResponse } from "next/server";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { getConversationsByUserId } from "@/lib/utilities/data/fetching/userConversations";

export async function GET(
    req: Request
) {
    console.log('Fetching conversations...');
    try { 
        const user = await currentUser();

        if (!user) return new NextResponse('Unauthorized', {status: 401});
        
        console.log('User found:', user.id);

        const conversations = await getConversationsByUserId(user.id);

        const oppositeMembers = conversations.map(conv => 
            conv.memberOneId === user.id ? conv.memberTwo : conv.memberOne
        );
        
        console.log('Opposite members found:', oppositeMembers.length);
        
        const formattedMembers = oppositeMembers.map(member => ({
            id: member.user.id,
            username: member.user.username,
            image: member.user.image
        }));
        console.log('Formatted members found:', formattedMembers.length);

        return NextResponse.json(formattedMembers);
    } catch (error) {
        console.log(error);
        return new NextResponse('Route accessed, but Conversation List Retrieval Failed!', {status: 500});
    }
}