'use client'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Archive, ChevronDown, LogOut, PlusCircle, Settings, UserPlus, Users } from "lucide-react";
import { ServerWithMembersAndProfiles } from "@/lib/entities/servers";
import { MemberRole } from "@prisma/client";
import { useModal } from "@/hooks/use-modal-store";

interface ServerHeaderProps {
    server: ServerWithMembersAndProfiles;
    role?: MemberRole;
}

const ServerHeader = ({
    server, role
}: ServerHeaderProps) => {

    const { onOpen } = useModal();

    const isAdmin = role === 'ADMIN';
    const isModerator = isAdmin || role === 'MODERATOR'

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className='focus:outline-none' asChild>
                <button className='w-full text-md font-semibold px-3 
                flex items-center h-12 border-zinc-800 border-b-2
                hover:bg-zinc-700/50 transition text-white'>
                    {server.name}
                    <ChevronDown className='h-5 w-5 ml-auto'/>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-56 bg-black text-xs font-medium 
            text-neutral-400 space-y-[2px]'>
                {isModerator && (
                    <DropdownMenuItem className='text-indigo-200 hover:bg-sky-600 px-3 py-2 text-sm cursor-pointer'>
                        Add New Bot
                        <UserPlus className='h-4 w-4 ml-auto'/>
                    </DropdownMenuItem>
                )}
                {isModerator && (
                    <DropdownMenuItem 
                    onClick={() => onOpen('invite', { server })}
                    className='text-indigo-200 hover:bg-sky-600 px-3 py-2 text-sm cursor-pointer'>
                        Invite User
                        <UserPlus className='h-4 w-4 ml-auto'/>
                    </DropdownMenuItem>
                )}                
                {isAdmin && (
                    <DropdownMenuItem className='px-3 py-2 text-sm cursor-pointer'>
                        Server Settings
                        <Settings className='h-4 w-4 ml-auto'/>
                    </DropdownMenuItem>
                )}
                {isModerator && (
                    <DropdownMenuItem className='px-3 py-2 text-sm cursor-pointer'>
                        Manage Bots & Members
                        <Users className='h-4 w-4 ml-auto'/>
                    </DropdownMenuItem>
                )}
                {isModerator && (
                    <DropdownMenuItem className='px-3 py-2 text-sm cursor-pointer'>
                        Create Channel
                        <PlusCircle className='h-4 w-4 ml-auto'/>
                    </DropdownMenuItem>
                )}
                {isAdmin && (
                    <DropdownMenuSeparator />
                )}
                {isAdmin && (
                    <DropdownMenuItem className='text-rose-500 px-3 py-2 text-sm cursor-pointer'>
                        Manage Server
                        <Archive className='h-4 w-4 ml-auto'/>
                    </DropdownMenuItem>
                )}
                {!isAdmin && (
                    <DropdownMenuItem className='text-rose-500 px-3 py-2 text-sm cursor-pointer'>
                        Leave Server
                        <LogOut className='h-4 w-4 ml-auto'/>
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default ServerHeader;