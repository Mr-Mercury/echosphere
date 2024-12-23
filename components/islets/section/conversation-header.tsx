'use client'

import { useModal } from "@/hooks/use-modal-store";

export const ConversationHeader = () => {
    const {onOpen} = useModal();

    return(
        <div className='flex items-center justify-center py-2'>
            <p className='text-xs uppercase font-semibold text-secondary'>
                Active Server Conversations
            </p>
        </div>
    )
}