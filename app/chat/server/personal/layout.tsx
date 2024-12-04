import { ConversationSidebar } from "@/components/content-sidebar-components/conversation-sidebar/conversation-sidebar";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { getConversationsByUserId } from "@/lib/utilities/data/fetching/userConversations";
import { redirect } from "next/navigation";

type ConversationNode = {
    id: string;
    username: string;
    image: string;
}

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
                ? conv.memberTwo.user 
                : conv.memberOne.user;
            return otherUser as ConversationNode;
        });
        
    } catch (error) {
        console.error('Conversation List Retrieval Failed: ', error);
    }


    return (
        <div className='h-full'>
            <div className='hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0'>
                <ConversationSidebar activeConversations={activeConversations}/>
            </div>
            <main className='h-full w-full md:pl-60'>
                {children}
            </main>
        </div>
    )
}
export default ConversationLayout;