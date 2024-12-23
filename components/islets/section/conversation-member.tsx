'use client';

import { useParams, useRouter } from "next/dist/client/components/navigation";
import { UserAvatar } from "../users/user-avatar";
import { cn } from "@/lib/utilities/clsx/utils";

interface ConversationMemberProps {
    id: string;
    avatar: string;
    username: string;
}

export const ConversationMember = ({id, avatar, username}: ConversationMemberProps) => {
    const router = useRouter();
    const params = useParams();

    const onClick = () => {
        router.push(`/chat/server/personal/dm/${id}`)
    }

    return(
        <button onClick={onClick}
        className={cn(
        'group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/50 transition mb-1',
            params?.memberId === id && 'bg-zinc-700'
        )}>
            <UserAvatar src={avatar} className='h-8 w-8 md:h-8 md:w-8 mr-2'/>
            <p className={cn('font-semibold text-sm text-zinc-400 group-hover:text-zinc-300 transition',
            params?.memberId === id && 'text-zinc-200 group-hover:text-white')}
            >
                {username}
            </p>
        </button>
    )
}