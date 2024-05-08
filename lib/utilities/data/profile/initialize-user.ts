import { auth } from "@/auth";
import { db } from "@/lib/db/db";
import { redirect } from "next/navigation";

export const initializeProfile = async () => {
    const session = await auth();
    const user = session?.user;
    
    if (!user) redirect('/login');

    const initializedUser = await db.user.findUnique({
        where: {
            id: user.id
        }
    });

    if (initializedUser?.initialized) {
        return initializedUser;
    }



    const initializationObject = await db.user.update({
        where: {
            id: user.id
        },
        data: {
            friendId: 
        }
    })

}