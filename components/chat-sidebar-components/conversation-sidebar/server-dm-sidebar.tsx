'use client';

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ConversationMember } from "@/components/islets/section/conversation-member";
import { ConversationHeader } from "@/components/islets/section/conversation-header";
import { useRouter } from "next/navigation";

type ServerDmNode = {
    userId: string;
    memberId: string;
    conversationId: string;
    username: string;
    image: string;
}

interface ServerDmSidebarProps {
    serverDms: ServerDmNode[];
}


export const ServerDmSidebar = ({ serverDms }: ServerDmSidebarProps) => {

    const router = useRouter();

    const onClick = (id: string) => {
        // TODO: This routing is weird, serverId isn't available here
        // This will need to be addressed later
        router.push(`/chat/server/personal/dm/${id}`)
    }

    return(
        <ScrollArea className='h-full w-full bg-[#383A40]'>
            <ConversationHeader />
            <Separator className='h-[2px] bg-zinc-600 rounded-md w-40 mx-auto'/>
            <div className="p-2">
                <h2 className="px-4 text-xs uppercase font-semibold text-zinc-400">
                    Direct Messages
                </h2>
                {serverDms.map((dm) => (
                    <ConversationMember 
                        key={dm.conversationId}
                        id={dm.memberId}
                        onClick={() => onClick(dm.memberId)}
                        username={dm.username}
                        avatar={dm.image}
                    />
                ))}
            </div>
        </ScrollArea>
    )
}