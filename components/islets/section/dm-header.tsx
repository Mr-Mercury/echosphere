'use client'

import NavTooltip from "@/components/server-listing-sidebar-components/nav-tooltip";
import { useModal } from "@/hooks/use-modal-store";
import { Plus } from "lucide-react";

export const DmHeader = () => {
    const {onOpen} = useModal();

    return(
        <div className='flex items-center justify-between px-4 py-2 bg-[#2B2D31]'>
            <p className='text-xs uppercase font-semibold text-secondary flex-1 text-center'>
                DMs & One-on-One Conversations
            </p>
            <NavTooltip label='Create DM'>
                <button 
                    className='text-zinc-400 hover:text-zinc-300 transition'
                    onClick={() => onOpen('createDM')}
                >
                    <Plus className='h-4 w-4'/>
                </button>
            </NavTooltip>
        </div>
    )
}