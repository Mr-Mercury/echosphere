import { Hash } from "lucide-react";
import { MobileToggle } from "../islets/mobile/mobile-toggle";

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
            <p className='font-semibold text-md text-secondary'>
                {name}
            </p>
        </div>
    )
}

export default ChatHeader;