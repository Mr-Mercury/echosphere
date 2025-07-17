import { db } from "@/lib/db/db";

export const getPersonalBotConversationsByUserId = async (userId: string) => {
    
    const conversations = await db.personalBotConversation.findMany({
        where: {
            userId: userId
        },
        include: {
            bot: {
                select: {
                    id: true,
                    name: true,
                    imageUrl: true,
                }
            }
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });

    return conversations;
} 