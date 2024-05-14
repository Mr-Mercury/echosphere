import { db } from "@/lib/db/db";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { redirect } from "next/navigation";

interface InviteCodePageProps {
    params: {
        inviteCode: string;
    };
};


const InviteCodePage = async ({params}: InviteCodePageProps) => {

    const user = await currentUser();

    console.log(user);
    if (!user) return redirect('/login');
    if (!params.inviteCode) return redirect('/chat/personal')

    const existingServer = await db.server.findFirst({
        where: {
            inviteCode: params.inviteCode,
            members: {
                some: {
                    userId: user.id
                }
            }
        }
    })

    if (existingServer) return redirect(`/chat/server/${existingServer.id}`)

    const server = await db.server.update({
        where: {
            inviteCode: params.inviteCode,
        },
        data: {
            members: {
                create: [
                    {
                        userId: user.id
                    }
                ]
            }
        }
    })

    if (server) {
        return redirect(`/chat/server/${server.id}`)
    }

    return (
        <div>
            Invite Code Page
        </div>
    )
}

export default InviteCodePage;