import { db } from "./messageDbConnection.js";

export const messageGetUserById = async (id: string) => {
    try {
        const user = await db.user.findUnique({ where: {id}});
        return user;
    } catch {
        return null;
    }
}