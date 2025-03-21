'use client'

import NavTooltip from "@/components/server-listing-sidebar-components/nav-tooltip";
import { ModalType, useModal } from "@/hooks/use-modal-store";
import { cn } from "@/lib/utilities/clsx/utils";
import { Channel, ChannelType, MemberRole, Server } from "@prisma/client"
import { Edit, Hash, Lock, Mic2, Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

interface ChannelItemProps {
    channel: Channel;
    server: Server;
    role?: MemberRole;
}

const iconMap = {
    [ChannelType.TEXT]: Hash,
    [ChannelType.AUDIO]: Mic2,
}

export const ChannelItem = ({
    channel, server, role
}: ChannelItemProps) => {
    const {onOpen} = useModal();
    const params = useParams();
    const router = useRouter();

    const Icon = iconMap[channel.type];

    const onClick = () => {
        router.push(`/chat/server/${params?.serverId}/${channel.id}`)
    }

    const onAction = (e: React.MouseEvent, action: ModalType) => {
        e.stopPropagation();
        onOpen(action, {channel, server})
    }
    return (
        <button
            onClick={onClick}
            className={cn(
                'group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/50 transition mb-1',
                params?.channelId === channel.id && 'bg-zinc-700'
            )}>
            <Icon className='flex-shrink-0 w-5 h-5 text-zinc-400'/>
            <p className={cn(
                'line-clamp-1 font-semibold text-sm text-zinc-400 group-hover:text-zinc-300 transition',
                params?.channelId === channel.id && "text-zinc-200 group-hover:text-white"
            )}>
                {channel.name}
            </p>
            {channel.name !== 'general' && role !== MemberRole.GUEST && (
                <div className='ml-auto flex items-center gap-x-2'>
                    <NavTooltip label='Edit'>
                        <Edit onClick={(e) => onAction(e, 'editChannel')}
                        className='hidden group-hover:block h-4 w-4 text-zinc-400 hover:text-zinc-300 transnition'/>
                    </NavTooltip>
                    <NavTooltip label='Delete'>
                        <Trash onClick={(e) => onAction(e, 'deleteChannel')}
                        className='hidden group-hover:block h-4 w-4 text-zinc-400 hover:text-zinc-300 transnition'/>
                    </NavTooltip>
                </div>
            )}
            {channel.name === 'general' && role !== MemberRole.GUEST && (
                <Lock className='ml-auto h-4 w-4 text-zinc-400' />
            )}
        </button>
    )
}