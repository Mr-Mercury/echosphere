'use client';

import { cn } from "@/lib/utilities/clsx/utils";
import { Member, Server, User, BotConfiguration } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import { UserAvatar } from "../users/user-avatar";
import { getRoleIcon } from "@/lib/utilities/role-icons";
import { useState, useEffect } from "react";
import NavTooltip from "@/components/server-listing-sidebar-components/nav-tooltip";
import { Edit, MessageSquare, Pause, Play, Trash2 } from "lucide-react";
import { useBotToggleStore } from '@/hooks/use-bot-toggle-store';
import { useModal } from "@/hooks/use-modal-store";
import { ServerWithMembersAndProfiles } from "@/lib/entities/servers";
import { getServerChannelsById } from "@/lib/utilities/data/fetching/serverData";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

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
    const { 
        isTogglingAny, 
        setIsTogglingAny, 
        serverBotUpdateTimestamp,
        setBotStatus
    } = useBotToggleStore();
    const { onOpen } = useModal();
    // Hydration error mismatch fix - do not remove the mounted & state pattern 
    const [mounted, setMounted] = useState(false);
    const [botActive, setBotActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [serverWithMembers, setServerWithMembers] = useState<ServerWithMembersAndProfiles | null>(null);
    
    // Check for server-wide bot status changes
    useEffect(() => {
        if (member.user.botConfig && mounted) {
            const lastServerUpdate = serverBotUpdateTimestamp[server.id];
            
            // If there was a server update and this is a bot
            if (lastServerUpdate !== undefined && member.role === 'ECHO') {
                // Check if this is a server-stop (timestamp = 0) or server-start (timestamp > 0)
                const isServerStarting = lastServerUpdate > 0;
                
                // Update the local state to match the server action
                // For server-stop (timestamp = 0), all bots should be inactive
                // For server-start (timestamp > 0), update will come from the store directly
                if (!isServerStarting) {
                    setBotActive(false);
                }
                
                // Global store is updated by the server-listing component directly
            }
        }
    }, [serverBotUpdateTimestamp, server.id, member.role, member.user.botConfig, mounted]);

    // Fetch complete server data when needed
    useEffect(() => {
        const fetchServerData = async () => {
            try {
                const user = await currentUser();
                if (!user) return;
                
                const serverData = await getServerChannelsById(server.id, user.id);
                if (serverData) {
                    setServerWithMembers(serverData);
                }
            } catch (error) {
                console.error("Failed to fetch server data:", error);
            }
        };
        fetchServerData();
    }, [server.id]);

    // Sync with bot status store
    const botStatuses = useBotToggleStore((state) => state.botStatuses);
    
    useEffect(() => {
        if (member.user.botConfig?.id && mounted) {
            const storeStatus = botStatuses[member.user.botConfig.id];
            if (storeStatus !== undefined) {
                setBotActive(storeStatus);
            }
        }
    }, [botStatuses, member.user.botConfig?.id, mounted]);

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
            
            // Update the global store with this bot's status
            if (member.user.botConfig?.id) {
                setBotStatus(member.user.botConfig.id, newState);
            }
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

    const isBot = member.role === 'ECHO';

    return (
        <div className={cn(
            'group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/50 transition mb-1 relative',
            params?.memberId === member.id && 'bg-zinc-700'
        )}>
            <UserAvatar 
                src={member.user.image}
                className='h-8 w-8 md:h-8 md:w-8 flex-shrink-0'
            />
            <div className='flex items-center w-full pr-10'>
                <DropdownMenu>
                    <DropdownMenuTrigger className='focus:outline-none w-full' asChild>
                        <button className='flex items-center min-w-0 w-full text-left'>
                            {getRoleIcon(member.role, 'mr-1 flex-shrink-0', member.user.botConfig?.modelName)}
                            <p className={cn(
                                'font-semibold text-sm text-zinc-400 group-hover:text-zinc-300 transition',
                                params?.memberId === member.id && 'text-zinc-200 group-hover:text-white'
                            )}>
                                {member.user.username!.length > 10 
                                    ? `${member.user.username!.slice(0, 10)}...` 
                                    : member.user.username}
                            </p>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className='w-48 bg-black text-xs font-medium 
                    text-neutral-400 space-y-[2px]'>
                        <DropdownMenuItem 
                            onClick={onMemberClick}
                            className='px-3 py-2 text-sm cursor-pointer'>
                            Message
                            <MessageSquare className='h-4 w-4 ml-auto'/>
                        </DropdownMenuItem>
                        {isBot && (
                            <>
                                <DropdownMenuItem 
                                    onClick={() => onOpen('editBot', { botUser: member.user })}
                                    className='px-3 py-2 text-sm cursor-pointer'>
                                    Inspect & Edit Bot
                                    <Edit className='h-4 w-4 ml-auto'/>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={() => {
                                        if (serverWithMembers) {
                                            onOpen('deleteBot', { server: serverWithMembers, member });
                                        }
                                    }}
                                    className='px-3 py-2 text-sm cursor-pointer text-rose-500'>
                                    Delete Bot
                                    <Trash2 className='h-4 w-4 ml-auto'/>
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
                
                {isBot && (
                    <div className='absolute right-2 z-10'>
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
                                    'p-1 rounded-md transition overflow-visible',
                                    botActive ? 'text-green-500 hover:text-green-600' : 'text-red-500 hover:text-red-600',
                                    (isLoading || isTogglingAny) && 'opacity-50 cursor-not-allowed'
                                )}>
                                {botActive ? <Play size={16} /> : <Pause size={16} />}
                            </button>
                        </NavTooltip>
                    </div>
                )}
            </div>
        </div>
    )
}