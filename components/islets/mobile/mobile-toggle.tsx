import { Menu } from "lucide-react"

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ChannelSidebar } from "@/components/content-sidebar-components/channel-sidebar/channel-sidebar"
import ChatMainSidebar from "@/components/chat-sidebar-components/chat-main-sidebar"
export const MobileToggle = ({serverId}: {serverId: string}) => {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant='ghost' size='icon' className='md:hidden'>
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent side='left' className='pd-0 flex gap-0'>
                <div className='w-[72px]'>
                    <ChatMainSidebar />
                </div>
                {serverId && <ChannelSidebar serverId={serverId} />}\
            </SheetContent>
        </Sheet>
    )
}