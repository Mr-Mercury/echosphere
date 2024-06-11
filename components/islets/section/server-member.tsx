'use client';

import { cn } from "@/lib/utilities/clsx/utils";
import { Member, MemberRole, Server, User } from "@prisma/client";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { UserAvatar } from "../users/user-avatar";

interface ServerMemberProps {
    member: Member & { user: User};
    server: Server;

}
export const ServerMember = ({
    member, server
}: ServerMemberProps) => {
    
    const roleIconMap = {
        [MemberRole.GUEST]: null,
        [MemberRole.MODERATOR]: <ShieldCheck className='h-4 w-4 ml-2 text-indigo-500' />,
        [MemberRole.ADMIN]: <ShieldAlert className='h-4 w-4 ml-2 text-rose-500' />,
    }

    const params = useParams();
    const router = useRouter();

    const icon = roleIconMap[member.role];

    const onClick = () => {
        router.push(`chat/personal/${member.id}`)
    }

    //TYPESCRIPT GYMASTICS MAY EXPLODE SOMETHING
    if(!member.user.image) return

    return (
        <button onClick={onClick}
            className={cn(
            'group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/50 transition mb-1',
            params?.memberId === member.id && 'bg-zinc-700'
        )}>
            <UserAvatar 
                src={member.user.image}
                className='h-8 w-8 md:h-8 md:w-8'
            />
            <p className={cn('font-semibold text-sm text-zinc-400 group-hover:text-zinc-300 transition',
            params?.memberId === member.id && 'text-zinc-200 group-hover:text-white')}
            >
                {member.user.username}
            </p>
            {icon}
        </button>
    )
}