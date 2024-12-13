'use client'

import { Separator } from "@/components/ui/separator";
import { DmHeader } from "@/components/islets/section/dm-header";

export const DmSidebar = () => {
    return(
        <section className='h-full bg-[#2B2D31]'>
            <DmHeader />
            <Separator className='h-[2px] bg-zinc-600   
            rounded-md w-40 mx-auto'/>
        </section>
    )
}