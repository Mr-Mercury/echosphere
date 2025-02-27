'use client';

import { cn } from "@/lib/utilities/clsx/utils";
import { Member, Server, User } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import { UserAvatar } from "../users/user-avatar";
import { getRoleIcon } from "@/lib/utilities/role-icons";

interface ServerMemberProps {
    member: Member & { user: User};
    server: Server;
}

export const ServerMember = ({
    member,
    server
}: ServerMemberProps) => {
    const params = useParams();
    const router = useRouter();

    const onClick = () => {
        router.push(`/chat/server/personal/dm/${member.id}`)
    }

    if(!member.user.image) return null;

    return (
        <button onClick={onClick}
            className={cn(
            'group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/50 transition mb-1',
            params?.memberId === member.id && 'bg-zinc-700'
        )}>
            <UserAvatar 
                src={member.user.image}
                className='h-8 w-8 md:h-8 md:w-8 flex-shrink-0'
            />
            <div className='flex items-center min-w-0 flex-1'>
                {getRoleIcon(member.role, 'mr-1 flex-shrink-0')}
                <p className={cn(
                    'font-semibold text-sm text-zinc-400 group-hover:text-zinc-300 transition truncate',
                    params?.memberId === member.id && 'text-zinc-200 group-hover:text-white'
                )}>
                    {member.user.username}
                </p>
            </div>
        </button>
    )
}