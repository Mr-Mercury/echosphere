'use client'

import NavTooltip from "@/components/chat-sidebar-components/nav-tooltip";
import { useModal } from "@/hooks/use-modal-store";
import { ServerWithMembersAndProfiles } from "@/lib/entities/servers";
import { ChannelType, MemberRole } from "@prisma/client";
import { Plus } from "lucide-react";

interface ServerListingProps {
    label: string;
    role?: MemberRole;
    sectionType: 'channels' | 'members';
    channelType?: ChannelType;
    server?: ServerWithMembersAndProfiles; 
}

export const ServerListing = ({
    label, role, sectionType, channelType, server
}: ServerListingProps) => {

    const {onOpen} = useModal();

    return (
        <div className='flex items-center justify-between py-2'>
            <p className-='text-xs uppercase font-semibold text-zinc-400'>
                {label}
            </p>
            {role !== MemberRole.GUEST && sectionType === 'channels' && (
                <NavTooltip label='Create Channel' side='top'>
                    <button 
                        onClick={() => onOpen('createChannel')}
                        className='text-zinc-400 hover:text-zinc-300 transition'>
                        <Plus className='h-4 w-4'/>
                    </button>
                </NavTooltip>
            )}
        </div>
    )
}