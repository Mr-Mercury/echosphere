'use client';

import { cn } from "@/lib/utilities/clsx/utils";
import { Member, Server, User, BotConfiguration } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import { UserAvatar } from "../users/user-avatar";
import { getRoleIcon } from "@/lib/utilities/role-icons";
import { useState, useEffect } from "react";
import NavTooltip from "@/components/chat-sidebar-components/nav-tooltip";
import { Pause, Play } from "lucide-react";

interface ServerMemberProps {
    member: Member & { 
        user: User & { 
            botConfig: BotConfiguration | null 
        }
    };
    server: Server;
}

export const ServerMember = ({
    member,
    server
}: ServerMemberProps) => {
    const params = useParams();
    const router = useRouter();
    // Hydration error mismatch fix - do not remove the mounted & state pattern 
    const [mounted, setMounted] = useState(false);
    const [botActive, setBotActive] = useState(false);

    useEffect(() => {
        setBotActive(member.user.botConfig?.isActive ?? false);
        setMounted(true);
    }, [member.user.botConfig?.isActive]);

    const onClick = () => {
        router.push(`/chat/server/personal/dm/${member.id}`)
    }

    if (!mounted) return null;

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
            <div className='flex items-center min-w-0 flex-1 justify-between'>
                <div className='flex items-center min-w-0'>
                    {getRoleIcon(member.role, 'mr-1 flex-shrink-0')}
                    <p className={cn(
                        'font-semibold text-sm text-zinc-400 group-hover:text-zinc-300 transition truncate',
                        params?.memberId === member.id && 'text-zinc-200 group-hover:text-white'
                    )}>
                        {member.user.username}
                    </p>
                </div>
                {member.role === 'ECHO' && (
                    <NavTooltip label={botActive ? 'Deactivate Bot' : 'Activate Bot'} side='top'>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setBotActive(!botActive);
                            }}
                            className={cn(
                                'ml-1 p-1 rounded-md transition',
                                botActive ? 'text-green-500 hover:text-green-600' : 'text-red-500 hover:text-red-600'
                            )}>
                            {botActive ? <Play size={16} /> : <Pause size={16} />}
                        </button>
                    </NavTooltip>
                )}
            </div>
        </button>
    )
}