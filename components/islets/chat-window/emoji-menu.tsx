'use client';

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Smile } from "lucide-react";
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

interface EmojiMenuProps {
    onChange: (value: string) => void;
}


const EmojiMenu = ({onChange}: EmojiMenuProps) => {
    return (
        <Popover>
            <PopoverTrigger>
                <Smile className='text-zinc-400 hover:text-zinc-300 transition' />
            </PopoverTrigger>
            <PopoverContent side='right' sideOffset={40} 
            className='bg-transparent border-none shadow-none 
            drop-shadow-none mb-16'>
                <Picker data={data} onEmojiSelect={(emoji: any) => onChange(emoji.native)}/>
            </PopoverContent>
        </Popover>
    )
}

export default EmojiMenu;
