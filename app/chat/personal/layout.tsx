// ====================================================================================
// ARCHITECTURAL NOTE:
// This layout is a UNIFIED VIEW for ALL direct messages (DMs).
// 1. Global User DMs (`UserConversation` model): Global user-to-user DMs
//    that work across all servers. Rendered in <ServerDmSidebar />.
// Later on, can also add PERSONAL BOT DMs to this layout.
// 2. Personal Bot DMs (`PersonalBotConversation` model): Private, serverless DMs
//    with a user's personal bots. Rendered in <PersonalBotDmSidebar />.
// ====================================================================================
import { ServerDmSidebar } from "@/components/chat-sidebar-components/conversation-sidebar/server-dm-sidebar";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { getConversationsByUserId } from "@/lib/utilities/data/fetching/userConversations";
import { redirect } from "next/navigation";
import { PersonalBotDmSidebar } from "@/components/chat-sidebar-components/dm-sidebar/personal-bot-dm-sidebar";
import { getPersonalBotConversationsByUserId } from "@/lib/utilities/data/fetching/personalBotConversations";
import { PersonalBot, PersonalBotConversation } from "@prisma/client";

type ServerDmNode = {
    userId: string;
    conversationId: string;
    username: string;
    image: string;
}

type PersonalBotConversationWithBot = PersonalBotConversation & {
    bot: PersonalBot;
};

const UnifiedDmLayout = async ({ children }: {
    children: React.ReactNode;
}) => {    
    
    let serverDms: ServerDmNode[] = [];
    let personalBotDms: PersonalBotConversationWithBot[] = [];
    try {
        const user = await currentUser();
        if (!user) return redirect('/');

        const serverConversations = await getConversationsByUserId(user.id);
        personalBotDms = await getPersonalBotConversationsByUserId(user.id) as PersonalBotConversationWithBot[];

        serverDms = serverConversations.map(conv => {
            const otherUser = user.id === conv.userOne.id 
                ? conv.userTwo 
                : conv.userOne;
            
            return {
                userId: otherUser.id, 
                conversationId: conv.id, 
                username: otherUser.username, 
                image: otherUser.image
            } as ServerDmNode;
        });
        
    } catch (error) {
        console.error('Conversation List Retrieval Failed: ', error);
    }


    return (
        <div className='h-full'>
            <div className='hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0'>
                <ServerDmSidebar serverDms={serverDms}/>
            </div>
            <main className='h-full w-full md:pl-60'>
                {children}
            </main>
        </div>
    )
}
export default UnifiedDmLayout;