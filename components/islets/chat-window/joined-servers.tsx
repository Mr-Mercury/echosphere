import ChatNavItem from "@/components/chat-sidebar-components/chat-nav-item";
import { UserType } from "@/lib/entities/user";


const JoinedServers = (user: UserType) => {
    if (!user.servers || user.servers.length === 0) return null;
    
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