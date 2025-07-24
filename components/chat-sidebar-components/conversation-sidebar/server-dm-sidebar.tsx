'use client';

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ConversationMember } from "@/components/islets/section/conversation-member";
import { ConversationHeader } from "@/components/islets/section/conversation-header";

type ServerDmNode = {
    userId: string;
    conversationId: string;
    username: string;
    image: string;
}

interface ServerDmSidebarProps {
    serverDms: ServerDmNode[];
}


export const ServerDmSidebar = ({ serverDms }: ServerDmSidebarProps) => {

    return(
        <ScrollArea className='h-full w-full bg-[#383A40]'>
            <ConversationHeader />
            <Separator className='h-[2px] bg-zinc-600 rounded-md w-40 mx-auto'/>
            <div className="p-2">
                {serverDms.map((dm) => (
                    <ConversationMember 
                        key={dm.conversationId}
                        id={dm.userId}
                        username={dm.username}
                        avatar={dm.image}
                    />
                ))}
            </div>
        </ScrollArea>
    )
}