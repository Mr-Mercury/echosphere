import { auth } from "@/auth";
import { db } from "@/lib/db/db";
import { redirect } from "next/navigation";
import { generateRandomUsername, generateRandomName } from "../../mocking/mock";

export const initializeProfile = async () => {
    const session = await auth();
    const user = session?.user;
    
    if (!user) redirect('/login');

    const currentUser = await db.user.findUnique({
        where: {
            id: user.id
        }
    });

    if (currentUser?.initialized) return currentUser;

    if (user.name) user.username = generateRandomUsername()  
        else user.name = generateRandomName();

    const defaultImage = 'https://utfs.io/f/ae34682c-5a6c-4320-92ca-681cd4d93376-plqwlq.jpg';

    const initializedUser = await db.user.update({
        where: {
            id: user.id
        },
        data: {
            name: user.name,
            username: user.username,
            initialized: true, 
            image: defaultImage
        }
    })

    return initializedUser;
}