import ChatNavItem from "@/components/chat-sidebar-components/chat-nav-item";
import { db } from "@/lib/db/db";
import { UserType } from "@/lib/entities/user";
import { generateRandomServer } from "@/lib/utilities/mocking/mock";


const JoinedServers = async (user: UserType) => {
    // TODO: Uncomment once you've created the actual server framework
    // if (!user.servers || user.servers.length === 0) return null;

    const servers = await db.server.findMany()
    
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