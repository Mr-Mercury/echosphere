import { db } from "../db/db"

export const globalConversationUtil = async (userOneId: string, userTwoId: string) => {
    if (userOneId === userTwoId) {
        throw new Error("Cannot create conversation with yourself");
    }

    let conversation = await findGlobalConversation(userOneId, userTwoId) || 
        await findGlobalConversation(userTwoId, userOneId);

    if (!conversation) {
        console.log('No existing global conversation found, creating new one');
        conversation = await createGlobalConversation(userOneId, userTwoId);
    }

    return conversation;
}

const findGlobalConversation = async (userOneId: string, userTwoId: string) => {
    try {
        return await db.userConversation.findFirst({
            where: {
                AND: [
                    { userOneId: userOneId },
                    { userTwoId: userTwoId },
                ]
            },
            include: {
                userOne: {
                    select: {
                        id: true,
                        username: true,
                        image: true,
                        friendId: true
                    }
                },
                userTwo: {
                    select: {
                        id: true,
                        username: true,
                        image: true,
                        friendId: true
                    }
                }
            }
        })
    } catch (error) {
        console.error('Error finding global conversation:', error);
        return null;
    }
}

const createGlobalConversation = async (userOneId: string, userTwoId: string) => {
    try {
        return await db.userConversation.create({
            data: {
                userOneId,
                userTwoId,
            },
            include: {
                userOne: {
                    select: {
                        id: true,
                        username: true,
                        image: true,
                        friendId: true
                    }
                },
                userTwo: {
                    select: {
                        id: true,
                        username: true,
                        image: true,
                        friendId: true
                    }
                }
            }
        })
    } catch (error) {
        console.error('Error creating global conversation:', error);
        return null;
    }
}

// Get all conversations for a user
export const getGlobalConversationsByUserId = async (userId: string) => {
    console.log('Fetching global conversations for user:', userId);
    
    try {
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
                        image: true,
                        friendId: true
                    }
                },
                userTwo: {
                    select: {
                        id: true,
                        username: true,
                        image: true,
                        friendId: true
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });
        
        console.log('Global conversations found:', conversations.length);
        return conversations;
    } catch (error) {
        console.error('Error fetching global conversations:', error);
        return [];
    }
} 