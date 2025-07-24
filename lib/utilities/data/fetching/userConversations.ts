import { db } from "@/lib/db/db";

export const getConversationsByUserId = async (userId: string) => {

    console.log('Fetching conversations for user:', userId);
    
    const conversations = await db.userConversation.findMany({
        where: {
            OR: [
                { userOneId: userId },
                { userTwoId: userId }
            ]
        },
        include: {
            userOne: {
                select: {
                    id: true,
                    username: true,
                    image: true
                }
            },
            userTwo: {
                select: {
                    id: true,
                    username: true,
                    image: true
                }
            }
        }
    });
    console.log('Conversations found:', conversations);
    return conversations;
}