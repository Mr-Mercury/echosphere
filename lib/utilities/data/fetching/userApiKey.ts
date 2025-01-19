import { db } from "@/lib/db/db";

export const fetchUserApiKey = async (userId: string) => {
    const user = await db.user.findUnique({
        where: { id: userId },
        select: { apiKey: true }
    });
    return user?.apiKey;
}