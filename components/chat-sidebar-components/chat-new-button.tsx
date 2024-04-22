'use client'

import { Plus } from "lucide-react";

const ChatNewButton = () => {
    return (
        <div>
            <button className='group flex items-center'>
                <div className='flex mx-3 h-[48px] w-[48px]
                rounded-[24px] group-hover:rounded-[16px]
                transition-all overflow-hidden items-center
                justify-center bg-[#313338]
                group-hover:bg-sky-500'>
                    <Plus className='group-hover:text-white
                    transition text-sky-500' size={25}/>
                </div>
            </button>
        </div>
    )
}

export default ChatNewButton;