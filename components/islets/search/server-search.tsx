'use client'

import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ChannelType, MemberRole } from "@prisma/client";
import { Hash, Mic2, Search, ShieldAlert, ShieldCheck } from "lucide-react";
import { useState } from "react";

interface ServerSearchProps {
    data: {
        label: string;
        type: 'channel' | 'member';
        data: {
            icon: React.ReactNode;
            name: string;
            id: string;
        }[] | undefined
    }[];
}

const ServerSearch = ({ 
    data
}: ServerSearchProps) => {
    const [open, setOpen] = useState(false);
    console.log(data);
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
                    <span className='text-base'>⌘</span>F
                </kbd>
            </button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder='Search channels & members'/>
                <CommandList>
                    <CommandEmpty>
                    No Results Found
                    </CommandEmpty>
                    {data.map(({ label, type, data }) => {
                        if (!data?.length) return null;

                        return (
                            <CommandGroup key={label} heading={label}>
                                {data?.map(({ id, icon, name }) => {
                                    return (
                                        <CommandItem key={id}>
                                            {icon}
                                            <span>{name}</span>
                                        </CommandItem>
                                    )
                                })}
                            </CommandGroup>
                        )

                    } )}
                </CommandList>
            </CommandDialog>
        </>
    )
}

export default ServerSearch