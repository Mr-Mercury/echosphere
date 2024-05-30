'use client'

import { ChannelType, MemberRole } from "@prisma/client";
import { Hash, Mic2, ShieldAlert, ShieldCheck } from "lucide-react";

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

const ServerSearch = ({ 
    data
}: ServerSearchProps) => {
    return (
        <div>
            Search Component (Server)
        </div>
    )
}

export default ServerSearch