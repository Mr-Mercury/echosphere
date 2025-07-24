import ChatHeader from "@/components/message-window/chat-header";
import ChatMessages from "@/components/message-window/chat-messages";
import ChatInput from "@/components/message-window/chat-input";
import { db } from "@/lib/db/db";
import { globalConversationUtil } from "@/lib/utilities/global-conversation";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { redirect } from "next/navigation";

interface UserIdPageProps {
    params: {
        userId: string;
    }
}

const messageHandlerApiUrl = process.env.NEXT_PUBLIC_MESSAGE_HANDLER_URL as string;
const userDmApiUrl = "/api/user-dms"; // We'll create this new API

const UserDmPage = async ({params}: UserIdPageProps) => {
    const user = await currentUser(); 
    if (!user) return redirect('/login');

    // Validate the other user exists
    const otherUser = await db.user.findUnique({
        where: {
            id: params.userId,
        },
        select: {
            id: true,
            username: true,
            image: true,
            human: true
        }
    });

    if (!otherUser) return redirect('/chat/personal');
    
    if (user.id === params.userId) return redirect('/chat/personal');

    const conversation = await globalConversationUtil(user.id, params.userId);

    if (!conversation) {
        return redirect('/chat/personal');
    }

    const { userOne, userTwo } = conversation;
    const otherUserInfo = userOne.id === user.id ? userTwo : userOne;

    return (
        <div className='bg-[#313338] flex flex-col h-full'>
            <ChatHeader 
                imageUrl={otherUserInfo.image!} 
                name={otherUserInfo.username!}
                type='userDm'
            />
            <ChatMessages 
                name={otherUserInfo.username!}
                chatId={conversation.id}
                messageApiUrl={userDmApiUrl}
                socketQuery={{ conversationId: conversation.id }}
                paramKey='conversationId'
                paramValue={conversation.id}
                type='userDm'
            />
            <ChatInput 
                apiUrl={messageHandlerApiUrl}
                query={{ conversationId: conversation.id }}                
                name={otherUserInfo.username!}
                type='userDm'
            />
        </div>
    )
}

export default UserDmPage; 