import { initializeProfile } from "@/lib/utilities/data/profile/initialize-user";
import { db } from "@/lib/db/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import CreateServerDialogue from "@/components/modal-dialog/servers/create-server-setup-dialog";
import { auth } from "@/auth";

const SetupPage = async () => {

    const session = await auth();

    const [currentUser, server] = await Promise.all([
        initializeProfile(),
        // TODO: implement system to store current server in local storage
        db.server.findFirst({
            where: {
                members: {
                    some: {
                        userId: session?.user?.id
                    }
                }
            }
        })
    ]);

    // TODO: Figure out why this crashes w context
    if (server) return redirect(`chat/server/${server.id}`);
    
    return (
        <div>
            <CreateServerDialogue />
            <Link href='/chat/server/personal'>Go to Profile</Link>
        </div>
    )

}

export default SetupPage;