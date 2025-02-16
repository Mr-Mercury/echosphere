import { db } from "./messageDbConnection.js";
export const messageGetUserById = async (id) => {
    try {
        const user = await db.user.findUnique({ where: { id } });
        return user;
    }
    catch {
        return null;
    }
};
//# sourceMappingURL=messageGetUserById.js.map