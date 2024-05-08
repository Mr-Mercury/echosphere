'use client'
import ChatNavItem from "@/components/chat-sidebar-components/chat-nav-item";
import { UserType } from "@/lib/entities/user";
import { generateRandomServer } from "@/lib/utilities/mocking/mock";


const JoinedServers = (user: UserType) => {
    // TODO: Uncomment once you've created the actual server framework
    // if (!user.servers || user.servers.length === 0) return null;

    user.servers = generateRandomServer(14);
    
    return (
        <ul className='mb-4'>
                {Array.from(user.servers).map(server => (
                    <li key={server.id}>
                        <ChatNavItem id={server.id} name={server.name} image={server.image}/>
                    </li>
                ))}
        </ul>
    )
}

export default JoinedServers;