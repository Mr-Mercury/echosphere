import { auth } from "@/auth";
import { db } from "@/lib/db/db";

export const currentUser = async () => {
    const session = await auth();

    if (!session) {
        return null;
    }

    const id = session.user.id;

    const user = await db.user.findUnique({
        where: {
            id
        }
    })

    return user;
}