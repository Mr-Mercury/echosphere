import { db } from "@/lib/db/db";

export const getConversationsByUserId = async (userId: string) => {

    console.log('Fetching conversations for user:', userId);
    
    const conversations = await db.conversation.findMany({
        where: {
            OR: [
                { 
                    memberOne: {
                        userId: userId
                    }
                },
                { 
                    memberTwo: {
                        userId: userId
                    }
                }
            ]
        },
        include: {
            memberOne: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            image: true
                        }
                    }
                }
            },
            memberTwo: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            image: true
                        }
                    }
                }
            }
        }
    });
    console.log('Conversations found:', conversations);
    return conversations;
}