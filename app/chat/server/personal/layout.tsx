// ====================================================================================
// ARCHITECTURAL NOTE:
// This layout is a UNIFIED VIEW for ALL direct messages (DMs).
// It fetches TWO distinct types of DMs and renders them in separate sidebars:
// 1. Server-Context DMs (`Conversation` model): DMs with other users or bots
//    that are members of a server. Rendered in <ServerDmSidebar />.
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
    memberId: string;
    conversationId: string;
    username: string;
    image: string;
}

type PersonalBotConversationWithBot = PersonalBotConversation & {
    bot: PersonalBot;
};

// NOTE: THIS DATA AND STRUCTURAL PATTERN IS INTENDED TO ALLOW USERS TO 
// HAVE CONVERSATIONS WITH THE "SAME" BOT, BUT WITH DIFFERENT SHARED SERVER CONTEXT, 
// AS EACH CONversation IS OWNED BY A DIFFERENT SERVER MEMBERSHIP

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
            const otherUser = user.id === conv.memberOne.user.id 
                ? conv.memberTwo 
                : conv.memberOne;
            
            return {
                userId: otherUser.userId, 
                memberId: otherUser.id,
                conversationId: conv.id, 
                username: otherUser.user.username, 
                image: otherUser.user.image
            } as ServerDmNode;
        });
        
    } catch (error) {
        console.error('Conversation List Retrieval Failed: ', error);
    }


    return (
        <div className='h-full'>
            <div className='hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0'>
                <PersonalBotDmSidebar personalBotDms={personalBotDms}/>
                <ServerDmSidebar serverDms={serverDms}/>
            </div>
            <main className='h-full w-full md:pl-60'>
                {children}
            </main>
        </div>
    )
}
export default UnifiedDmLayout;