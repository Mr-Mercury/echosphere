import { db } from "../db/db";
export const conversationUtil = async (memberOneId, memberTwoId) => {
    let conversation = await findConversation(memberOneId, memberTwoId) ||
        await findConversation(memberTwoId, memberOneId);
    if (!conversation) {
        console.log('No existing conversation found, creating new one');
        conversation = await createConversation(memberOneId, memberTwoId);
    }
    return conversation;
};
const findConversation = async (memberOneId, memberTwoId) => {
    try {
        return await db.conversation.findFirst({
            where: {
                AND: [
                    { memberOneId: memberOneId },
                    { memberTwoId: memberTwoId },
                ]
            },
            include: {
                memberOne: {
                    include: {
                        user: true
                    }
                },
                memberTwo: {
                    include: {
                        user: true
                    }
                }
            }
        });
    }
    catch {
        return null;
    }
};
const createConversation = async (memberOneId, memberTwoId) => {
    try {
        return await db.conversation.create({
            data: {
                memberOneId,
                memberTwoId,
            },
            include: {
                memberOne: {
                    include: {
                        user: true
                    }
                },
                memberTwo: {
                    include: {
                        user: true
                    }
                }
            }
        });
    }
    catch {
        return null;
    }
};
//# sourceMappingURL=conversation.js.map