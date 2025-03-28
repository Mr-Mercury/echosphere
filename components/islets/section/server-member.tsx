'use client';

import { cn } from "@/lib/utilities/clsx/utils";
import { Member, Server, User, BotConfiguration } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import { UserAvatar } from "../users/user-avatar";
import { getRoleIcon } from "@/lib/utilities/role-icons";
import { useState, useEffect } from "react";
import NavTooltip from "@/components/server-listing-sidebar-components/nav-tooltip";
import { Pause, Play } from "lucide-react";
import { useBotToggleStore } from '@/hooks/use-bot-toggle-store';

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
    const { isTogglingAny, setIsTogglingAny } = useBotToggleStore();
    // Hydration error mismatch fix - do not remove the mounted & state pattern 
    const [mounted, setMounted] = useState(false);
    const [botActive, setBotActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setBotActive(member.user.botConfig?.isActive ?? false);
        setMounted(true);
    }, [member.user.botConfig?.isActive]);

    const onMemberClick = () => {
        router.push(`/chat/server/personal/dm/${member.id}`)
    }

    const onBotToggle = async (newState: boolean) => {
        try {
            setIsLoading(true);
            setIsTogglingAny(true);
            console.log('Attempting to toggle bot:', {
                botId: member.user.botConfig?.id,
                newState,
                url: `${process.env.NEXT_PUBLIC_MESSAGE_SERVER_URL}/bots/toggle`
            });

            const response = await fetch(`${process.env.NEXT_PUBLIC_MESSAGE_SERVER_URL}/bots/toggle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    botId: member.user.botConfig?.id,
                    isActive: newState
                })
            });

            const data = await response.json();
            console.log('Toggle response:', data);

            if (!response.ok) {
                throw new Error(`Failed to toggle bot: ${data.error || 'Unknown error'}`);
            }

            setBotActive(newState);
        } catch (error) {
            console.error('Failed to toggle bot:', error);
            setBotActive(!newState);
        } finally {
            setIsLoading(false);
            setIsTogglingAny(false);
        }
    }

    if (!mounted) return null;

    if(!member.user.image) return null;

    return (
        <button onClick={onMemberClick}
            className={cn(
            'group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/50 transition mb-1 relative',
            params?.memberId === member.id && 'bg-zinc-700'
        )}>
            <UserAvatar 
                src={member.user.image}
                className='h-8 w-8 md:h-8 md:w-8 flex-shrink-0'
            />
            <div className='flex items-center w-full pr-8'>
                <div className='flex items-center min-w-0 w-full'>
                    {getRoleIcon(member.role, 'mr-1 flex-shrink-0')}
                    <p className={cn(
                        'font-semibold text-sm text-zinc-400 group-hover:text-zinc-300 transition',
                        params?.memberId === member.id && 'text-zinc-200 group-hover:text-white'
                    )}>
                        {member.user.username!.length > 10 
                            ? `${member.user.username!.slice(0, 10)}...` 
                            : member.user.username}
                    </p>
                </div>
                {member.role === 'ECHO' && (
                    <div className='absolute right-2'>
                        <NavTooltip label={botActive ? 'Deactivate Bot' : 'Activate Bot'} side='top'>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isLoading && !isTogglingAny) {
                                        const newState = !botActive;
                                        setBotActive(newState);
                                        onBotToggle(newState);
                                    }
                                }}
                                disabled={isLoading || isTogglingAny}
                                className={cn(
                                    'p-1 rounded-md transition',
                                    botActive ? 'text-green-500 hover:text-green-600' : 'text-red-500 hover:text-red-600',
                                    (isLoading || isTogglingAny) && 'opacity-50 cursor-not-allowed'
                                )}>
                                {botActive ? <Play size={16} /> : <Pause size={16} />}
                            </button>
                        </NavTooltip>
                    </div>
                )}
            </div>
        </button>
    )
}