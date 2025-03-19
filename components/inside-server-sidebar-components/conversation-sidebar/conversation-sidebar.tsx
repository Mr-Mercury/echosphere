'use client'

import { ConversationHeader } from "@/components/islets/section/conversation-header";
import { ConversationMember } from "@/components/islets/section/conversation-member";
import { UserAvatar } from "@/components/islets/users/user-avatar";
import { Separator } from "@/components/ui/separator";
import { User } from "@prisma/client";
import { useRouter } from "next/dist/client/components/navigation";

interface activeConversationListType {
    userId: string;
    memberId: string;
    conversationId: string;
    username: string;
    image: string;
}

export const ConversationSidebar = ({activeConversations}: {activeConversations: activeConversationListType[]}) => {
    
    const router = useRouter();

    const onClick = (id: string) => {
        router.push(`/chat/server/personal/dm/${id}`)
    }
    
    return (
        <section className='h-full bg-[#2B2D31]'>
            <ConversationHeader />
            <Separator className='h-[2px] bg-zinc-600   
            rounded-md w-40 mx-auto'/>
            {activeConversations.map((conversation: activeConversationListType) => (
                <ConversationMember 
                key={conversation.conversationId} 
                id={conversation.memberId} 
                avatar={conversation.image} 
                username={conversation.username} 
                />
            ))}
        </section>
    )
}

export default ConversationSidebar;