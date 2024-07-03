import { initializeProfile } from "@/lib/utilities/data/profile/initialize-user";
import { db } from "@/lib/db/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import CreateServerDialogue from "@/components/modal-dialog/create-server-setup-dialog";

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