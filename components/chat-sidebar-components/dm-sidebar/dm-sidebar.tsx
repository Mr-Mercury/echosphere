'use client'

import { Separator } from "@/components/ui/separator";
import { DmHeader } from "@/components/islets/section/dm-header";
import { useRouter } from "next/navigation";
import { PersonalBotConversation, PersonalBot } from "@prisma/client";
import { BotDmMember } from "@/components/islets/section/bot-dm-member";

type PersonalBotConversationWithBot = PersonalBotConversation & {
    bot: PersonalBot;
};

interface DmSidebarProps {
    botConversations: PersonalBotConversationWithBot[];
}

export const DmSidebar = ({ botConversations }: DmSidebarProps) => {

    const router = useRouter();

    const onClick = (id: string) => {
        router.push(`/chat/personal/bot/${id}`)
    }

    return(
        <section className='h-full bg-[#2B2D31]'>
            <DmHeader />
            <Separator className='h-[2px] bg-zinc-600   
            rounded-md w-40 mx-auto'/>
            <div className="mt-2">
                <h2 className="px-4 text-xs uppercase font-semibold text-zinc-400">
                    Bot DMs
                </h2>
                {botConversations.map((conversation) => (
                    <BotDmMember 
                        key={conversation.id}
                        id={conversation.id}
                        onClick={() => onClick(conversation.id)}
                        username={conversation.bot.name}
                        avatar={conversation.bot.imageUrl || ''}
                    />
                ))}
            </div>
        </section>
    )
}