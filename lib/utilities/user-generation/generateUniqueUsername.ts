import { db } from "@/lib/db/db";

// Generates a unique username (with numbers at the end) - intended for bots but works for users too
export async function generateUniqueUsername(baseName: string): Promise<string> {
    const existingUsers = await db.user.findMany({
        where: {
            username: {
                startsWith: `${baseName}#`
            },
            human: false
        },
        orderBy: {
            username: 'desc'
        },
        take: 1
    });

    if (existingUsers.length === 0) {
        return `${baseName}#1`;
    }

    const previousUsername = existingUsers[0].username;
    const match = previousUsername?.match(/#(\d+)$/);
    if (!match) {
        return `${baseName}#1`;
    }

    const nextNumber = parseInt(match[1]) + 1;
    return `${baseName}#${nextNumber}`;
}