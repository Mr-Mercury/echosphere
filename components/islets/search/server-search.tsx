'use client'

import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Hash, Mic2, Search, ShieldAlert, ShieldCheck, MessageSquare, Edit } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useModal } from "@/hooks/use-modal-store";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface ServerSearchProps {
    data: {
        label: string;
        type: 'channel' | 'member';
        data: {
            icon: React.ReactNode;
            name: string;
            id: string;
            isBot?: boolean;
            user?: any;
        }[] | undefined
    }[];
}

const ServerSearch = ({ 
    data
}: ServerSearchProps) => {
    const [open, setOpen] = useState(false);
    const { onOpen } = useModal();
    const router = useRouter();
    const params = useParams();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey )) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        }

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const onMemberClick = (id: string) => {
        setOpen(false);
        router.push(`/chat/server/personal/dm/${id}`);
    }

    return (
        <>
            <button className='group px-2 py-2 rounded-md 
            flex items-center gap-x-2 w-full 
            hover:bg-zinc-600/50 transition'
            onClick={()=> setOpen(true)}
            >
                <Search className='w-4 h-4 text-secondary'/>
                <p className='font-semibold text-sm text-zinc-400 group-hover:text-secondary transition'>
                    Search Server
                </p>    
                <kbd className='text-secondary pointer-events-none inline-flex h-5
                    select-none items-center gap-1 rounded
                    bg-black px-1.5 font-mono text-[10px] font-medium
                    ml-auto'>
                    <span className='text-base'>⌘</span>K
                </kbd>
            </button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <Command className='bg-primary text-zinc-400'>
                    <CommandInput placeholder='Search channels & members'/>
                    <CommandList>
                        <CommandEmpty>
                        No Results Found
                        </CommandEmpty>
                        {data.map(({ label, type, data }) => {
                            if (!data?.length) return null;

                            return (
                                <CommandGroup key={label} heading={label}>
                                    {data?.map(({ id, icon, name, isBot, user }) => {
                                        return (
                                            <CommandItem key={id}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger className='focus:outline-none w-full' asChild>
                                                        <button className='flex items-center min-w-0 w-full text-left'>
                                                            {icon}
                                                            <span>{name}</span>
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className='w-48 bg-black text-xs font-medium 
                                                        text-neutral-400 space-y-[2px]'>
                                                        {type === 'member' && (
                                                            <>
                                                                <DropdownMenuItem 
                                                                    onClick={() => onMemberClick(id)}
                                                                    className='px-3 py-2 text-sm cursor-pointer'>
                                                                    Message
                                                                    <MessageSquare className='h-4 w-4 ml-auto'/>
                                                                </DropdownMenuItem>
                                                                {isBot && (
                                                                    <DropdownMenuItem 
                                                                        onClick={() => {
                                                                            setOpen(false);
                                                                            onOpen('editBot', { botUser: user });
                                                                        }}
                                                                        className='px-3 py-2 text-sm cursor-pointer'>
                                                                        Inspect & Edit Bot
                                                                        <Edit className='h-4 w-4 ml-auto'/>
                                                                    </DropdownMenuItem>
                                                                )}
                                                            </>
                                                        )}
                                                        {type === 'channel' && (
                                                            <DropdownMenuItem 
                                                                onClick={() => {
                                                                    setOpen(false);
                                                                    router.push(`/chat/server/${params?.serverId}/${id}`);
                                                                }}
                                                                className='px-3 py-2 text-sm cursor-pointer'>
                                                                Go to Channel
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </CommandItem>
                                        )
                                    })}
                                </CommandGroup>
                            )
                        })}
                    </CommandList>
                </Command>
            </CommandDialog>
        </>
    )
}

export default ServerSearch