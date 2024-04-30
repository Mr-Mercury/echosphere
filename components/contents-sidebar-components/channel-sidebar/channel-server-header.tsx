'use client'

import { ServerType } from "@/lib/entities/server";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface ServerHeaderProps {
    server: ServerType;
    role?: 'admin' | 'common';
}

const ServerHeader = ({
    server, role
}: ServerHeaderProps) => {

    const isAdmin = role === 'admin'

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className='focus:outline-none' asChild>
                <button className='w-full text-md font-semibold px-3 
                flex items-center h-12 border-neutral-800 border-b-2
                hover:bg-zinc-700/50 transition text-white'>
                    {server.name}
                    <ChevronDown className='h-5 w-5 ml-auto'/>
                </button>
            </DropdownMenuTrigger>
        </DropdownMenu>
    )
}

export default ServerHeader;