import { ConversationSidebar } from "@/components/chat-sidebar-components/conversation-sidebar/conversation-sidebar";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { getConversationsByUserId } from "@/lib/utilities/data/fetching/userConversations";
import { redirect } from "next/navigation";
import { DmSidebar } from "@/components/chat-sidebar-components/dm-sidebar/dm-sidebar";

type ConversationNode = {
    userId: string;
    memberId: string;
    conversationId: string;
    username: string;
    image: string;
}

// NOTE: THIS DATA AND STRUCTURAL PATTERN IS INTENDED TO ALLOW USERS TO 
// HAVE CONVERSATIONS WITH THE "SAME" BOT, BUT WITH DIFFERENT SHARED SERVER CONTEXT, 
// AS EACH CONVERSATION IS OWNED BY A DIFFERENT SERVER MEMBERSHIP

const ConversationLayout = async ({ children }: {
    children: React.ReactNode;
}) => {    
    
    let activeConversations: ConversationNode[] = [];
    try {
        const user = await currentUser();
        if (!user) return redirect('/');

        const conversations = await getConversationsByUserId(user.id);

        activeConversations = conversations.map(conv => {
            const otherUser = user.id === conv.memberOne.user.id 
                ? conv.memberTwo 
                : conv.memberOne;
            
            return {
                userId: otherUser.userId, 
                memberId: otherUser.id,
                conversationId: conv.id, 
                username: otherUser.user.username, 
                image: otherUser.user.image
            } as ConversationNode;
        });
        
    } catch (error) {
        console.error('Conversation List Retrieval Failed: ', error);
    }


    return (
        <div className='h-full'>
            <div className='hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0'>
                <DmSidebar />
                <ConversationSidebar activeConversations={activeConversations}/>
            </div>
            <main className='h-full w-full md:pl-60'>
                {children}
            </main>
        </div>
    )
}
export default ConversationLayout;