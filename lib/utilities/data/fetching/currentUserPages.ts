import { auth } from "@/auth";
import { db } from "@/lib/db/db";
import { NextApiRequest } from "next";

export const currentUser = async (req: NextApiRequest) => {
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