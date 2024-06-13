import { Hash } from "lucide-react";
import { MobileToggle } from "../islets/mobile/mobile-toggle";
import { UserAvatar } from "../islets/users/user-avatar";
import { SocketIndicator } from "../islets/socket-indicator/socket-indicator";

interface ChatHeaderProps {
    serverId: string;
    name: string;
    type: 'channel' | 'dm';
    imageUrl?: string;
}

const ChatHeader = ({serverId, name, type, imageUrl}: ChatHeaderProps) => {

    return (
        <div className='text-md w-full font-semibold px-3 flex items-center h-12 border-neutral-800 border-b-2'>
            <MobileToggle serverId={serverId}/>
            {type === 'channel' && (
                <Hash className='w-5 h-5 text-zinc-400 mr-2' />
            )}
            {type === 'dm' && (
                <UserAvatar src={imageUrl} className='h-8 w-8 md:h-8 w-8 mr-2'/>
            )}
            <p className='font-semibold text-md text-secondary'>
                {name}
            </p>
            <div className='ml-auto flex items-center'>
                <SocketIndicator />
            </div>
        </div>
    )
}

export default ChatHeader;