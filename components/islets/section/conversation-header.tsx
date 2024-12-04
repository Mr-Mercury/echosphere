'use client'

import NavTooltip from "@/components/chat-sidebar-components/nav-tooltip";
import { useModal } from "@/hooks/use-modal-store";
import { MemberRole } from "@prisma/client";
import { Plus, Settings } from "lucide-react";

export const ConversationHeader = () => {
    const {onOpen} = useModal();

    return(
        <div className='flex items-center justify-center py-2'>
            <p className='text-xs uppercase font-semibold text-zinc-400'>
                Active Conversations
            </p>
            <NavTooltip label='Create DM'>
                <button 
                    className='text-zinc-400 pl-3 hover:text-zinc-300 transition'
                    onClick={() => onOpen('createDM')}
                    >
                    <Plus className='h-4 w-4'/>
                </button>
            </NavTooltip>
        </div>
    )
}