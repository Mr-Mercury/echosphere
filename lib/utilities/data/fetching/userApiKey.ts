import { db } from "@/lib/db/db";

export const fetchUserApiKey = async (userId: string, model: string) => {
    try {
        const user = await db.user.findUnique({
            where: { id: userId },
            select: { apiKeys: true }
        });
        
        if (!user) {
            throw new Error(`API Key fetch error: User not found with id: ${userId}`);
        }
        
        if (!user.apiKeys) {
            return null;
        }

        const apiKey = (user.apiKeys as {[key: string]: string})?.[model];
        
        if (!apiKey) {
            return null;
        }

        return apiKey;

    } catch (error) {
        console.error('Error fetching API key:', error);
        throw new Error(`Failed to fetch API key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}