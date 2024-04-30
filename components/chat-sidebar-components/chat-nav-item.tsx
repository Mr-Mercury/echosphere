'use client';

import Image from "next/image";
import { useParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import NavTooltip from "./chat-nav-tooltip";

interface NavItemProps {
    id: string;
    image: string;
    name: string;
}

const ChatNavItem = ({ id, image, name }: NavItemProps) => {
    
    const params=useParams();

    return(
        <NavTooltip side='right' align='center' label={name}>
            <Link href={`/chat/server/${id}`} className='group relative 
            flex items-center'>
                <div className={cn
                ('absolute left-0 bg-white rounded-r-full transition-all w-[4px]',
                params?.id !== id && 'group-hover:h-[20px]',
                params?.id === id ? 'h-[36px]' : 'h-[8px]')} />
                <div className={cn
                ('relative group flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden',
                params?.id === id && 'bg-white/10 text-white rounded-[16px]'
                )}>
                    <Image fill src={image} alt='Server' />   
                </div>
            </Link>
        </NavTooltip>
    )
}

export default ChatNavItem;