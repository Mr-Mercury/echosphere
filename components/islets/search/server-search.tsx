'use client'

import { ChannelType, MemberRole } from "@prisma/client";
import { Hash, Mic2, Search, ShieldAlert, ShieldCheck } from "lucide-react";

interface ServerSearchProps {
    data: {
        label: string,
        type: 'channel' | 'member',
        data: {
            icon: React.ReactNode;
            name: string;
            id: string;
        }[] | undefined
    }[]
}

const iconMap = {
    [ChannelType.TEXT]: <Hash className='mr-2 h-4 w-4'/>,
    [ChannelType.AUDIO]: <Mic2 className='mr-2 h-4 w-4'/>,
}

const roleIconMap = {
    [MemberRole.GUEST]: null,
    [MemberRole.MODERATOR]: <ShieldCheck className='h-4 w-4 mr-2 text-indigo-500' />,
    [MemberRole.ADMIN]: <ShieldAlert className='h-4 w-4 mr-2 text-rose-500' />,
}
//STOP HERE
const ServerSearch = ({ 
    data
}: ServerSearchProps) => {
    return (
        <>
            <button className='group px-2 py-2 rounded-md 
            flex items-center gap-x-2 w-full 
            hover:bg-zinc-600/50 transition'>
                <Search className='w-4 h-4 text-secondary'/>
                <p className='font-semibold text-sm text-zinc-400 group-hover:text-secondary transition'>
                    Search Server
                </p>    
                <kbd className='text-secondary pointer-events-none inline-flex h-5
                    select-none items-center gap-1 rounded
                    bg-black px-1.5 font-mono text-[10px] font-medium
                    ml-auto'>
                    <span className='text-base'>⌘</span>F
                </kbd>
            </button>
        </>
    )
}

export default ServerSearch