import { initializeProfile } from "@/lib/utilities/data/profile/initialize-user";
import { db } from "@/lib/db/db";
import { redirect } from "next/navigation";
import Link from "next/link";

const SetupPage = async () => {
    const currentUser = await initializeProfile();

    const server = await db.server.findFirst({
        where: {
            members: {
                some: {
                    userId: currentUser.id
                }
            }
        }
    })

    if (server) return redirect(`chat/server/${server.id}`);
    
    return (
        <div>
            <div>Create a server</div>
            <Link href='/chat/server/personal'>Go to Profile</Link>
        </div>
    )

}

export default SetupPage;