'use server';

import { db } from '@/lib/db/db';
import { currentUser } from '@/lib/utilities/data/fetching/currentUser';
import { MemberRole } from '@prisma/client';

export const deleteServerBotAction = async (
    botId: string,
    serverId: string
): Promise<{ error?: string; success?: boolean; server?: any }> => {
    try {
        const user = await currentUser();
        if (!user) {
            return { error: "Unauthorized" };
        }

        // Verify the user has permission to delete bots in this server
        const serverMember = await db.member.findFirst({
            where: {
                serverId,
                userId: user.id,
                role: {
                    in: [MemberRole.ADMIN, MemberRole.MODERATOR]
                }
            }
        });

        if (!serverMember) {
            return { error: "You don't have permission to delete bots in this server" };
        }

        // Get the bot configuration to verify it exists in this server
        const botConfig = await db.botConfiguration.findFirst({
            where: {
                botUserId: botId,
                homeServerId: serverId
            }
        });

        if (!botConfig) {
            return { error: "Bot not found in this server" };
        }

        // First deactivate the bot to stop message generation
        await db.botConfiguration.update({
            where: { id: botConfig.id },
            data: { isActive: false }
        });

        // Notify message server to stop the bot
        await fetch(`${process.env.NEXT_PUBLIC_MESSAGE_SERVER_URL}/bots/stop`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                botId: botConfig.id
            })
        });

        // Wait a moment to ensure the bot has stopped
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Delete all related data in a transaction
        await db.$transaction([
            // First delete the bot configuration due to foreign key relationship
            db.botConfiguration.delete({
                where: {
                    botUserId: botId
                }
            }),
            // Then delete the member entries
            db.member.deleteMany({
                where: {
                    userId: botId
                }
            }),
            // Finally delete the bot user
            db.user.delete({
                where: {
                    id: botId
                }
            }),
            // TODO - add deleted bot record here, trigger (isDeleted) on bot messages
        ]);

        // Fetch the updated server data
        const updatedServer = await db.server.findUnique({
            where: { id: serverId },
            include: {
                members: {
                    include: {
                        user: true
                    }
                }
            }
        });

        return { success: true, server: updatedServer };

    } catch (error) {
        console.error('Server bot deletion failed:', error);
        return { error: 'Failed to delete bot' };
    }
}; 