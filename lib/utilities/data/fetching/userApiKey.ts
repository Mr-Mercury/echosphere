import { db } from "@/lib/db/db";

export const fetchUserApiKey = async (userId: string, model: string) => {
    try {
        const apiKey = await db.apiKey.findFirst({
            where: {
                userId,
                model,
                isActive: true
            },
            select: {
                id: true,
                key: true
            }
        });

        if (!apiKey) {
            // could also throw an error here
            return null;
        }

        return apiKey;

    } catch (error) {
        console.error('Error fetching user API key:', error);
        throw new Error(`Failed to fetch API key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}