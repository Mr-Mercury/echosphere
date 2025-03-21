'use client'

import { Plus } from "lucide-react";
import NavTooltip from "./nav-tooltip";
import { useModal } from "@/hooks/use-modal-store";

const ChatNewButton = () => {
    // TODO: Change styling on button (almost invisible atm)
    const { onOpen } = useModal();

    return (
        <div>
            <NavTooltip side='right' align='center' label='Add a room'>
                <button className='group flex items-center'
                onClick={() => onOpen('createServer')}>
                    <div className='flex mx-3 h-[48px] w-[48px]
                    rounded-[24px] group-hover:rounded-[16px]
                    transition-all overflow-hidden items-center
                    justify-center bg-[#313338]
                    group-hover:bg-sky-500'>
                        <Plus className='group-hover:text-white
                        transition text-sky-500' size={25}/>
                    </div>
                </button>
            </NavTooltip>
        </div>
    )
}

export default ChatNewButton;