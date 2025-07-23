import ChatHeader from "@/components/message-window/chat-header";
import ChatInput from "@/components/message-window/chat-input";
import ChatMessages from "@/components/message-window/chat-messages";
import { db } from "@/lib/db/db";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { redirect } from "next/navigation";

interface BotDmPageProps {
    params: {
        conversationId: string;
    }
}

const BotDmPage = async ({ params }: BotDmPageProps) => {
    
    const user = await currentUser();
    if (!user) {
        return redirect("/");
    }

    const conversation = await db.personalBotConversation.findUnique({
        where: {
            id: params.conversationId,
            userId: user.id,
        },
        include: {
            bot: true,
        }
    });

    if (!conversation) {
        return redirect("/chat/personal");
    }

    const { bot } = conversation;

    return (
        <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
            <ChatHeader 
                name={bot.name}
                type="botConversation"
                imageUrl={bot.imageUrl || undefined}
            />
            <ChatMessages 
                name={bot.name}
                member={{} as any} // Not needed for bot chat
                chatId={conversation.id}
                messageApiUrl="/api/personal-bot-messages"
                socketQuery={{
                    conversationId: conversation.id,
                }}
                paramKey="conversationId"
                paramValue={conversation.id}
                type="botConversation"
            />
            <ChatInput 
                name={bot.name}
                type="botConversation"
                apiUrl="/api/socket/messages"
                query={{
                    conversationId: conversation.id,
                }}
            />
        </div>
    );
}

export default BotDmPage; 