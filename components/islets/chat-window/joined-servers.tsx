import ChatNavItem from "@/components/server-listing-sidebar-components/chat-nav-item";
import { db } from "@/lib/db/db";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { redirect } from "next/navigation";

const JoinedServers = async () => {
    // TODO: Uncomment once you've created the actual server framework
    // if (!user.servers || user.servers.length === 0) return null;

    const user = await currentUser();
    if (!user) return redirect('/login')

    const servers = await db.server.findMany({
        where: {
            members: {
                some: {
                    userId: user?.id
                }
            }
        }
    })
    
    return (
        <ul className='mb-4'>
                {Array.from(servers).map(server => (
                    <li key={server.id}>
                        <ChatNavItem id={server.id} name={server.name} image={server.imageUrl}/>
                    </li>
                ))}
        </ul>
    )
}

export default JoinedServers;