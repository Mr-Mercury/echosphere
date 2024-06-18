import { auth } from "@/auth";
import { db } from "@/lib/db/db";
import { Session } from "next-auth";


// Basic flow -> get user submitted jwt, check token vs auth route with env encoded secret, return userId on backend
// for socket connection, proceed as originally planned. 

const socketUserCheck = async (session: Session) => {

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

module.exports = socketUserCheck;