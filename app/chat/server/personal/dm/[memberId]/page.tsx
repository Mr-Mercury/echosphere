import ChatHeader from "@/components/message-window/chat-header";
import ChatMessages from "@/components/message-window/chat-messages";
import ChatInput from "@/components/message-window/chat-input";
import { db } from "@/lib/db/db";
import { conversationUtil } from "@/lib/utilities/conversation";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { redirect } from "next/navigation";

// ==================== DEPRECATED ==================== 
// This page uses the old broken server-scoped DM system.
// Users should be redirected to /chat/personal/dm/[userId] instead.
// TODO: Remove this file after migration is complete
// ====================================================
interface MemberIdPageProps {
    params: {
        memberId: string;
        serverId: string;
    }
}

const messageHandlerApiUrl = process.env.NEXT_PUBLIC_MESSAGE_HANDLER_URL as string;
const dmApiUrl = process.env.NEXT_PUBLIC_DM_API_URL as string;

const MemberIdPage = async ({params}: MemberIdPageProps) => {

    const user = await currentUser(); 
    if (!user) return redirect('/login');

    const currentMember = await db.member.findFirst({
        where: {
            serverId: params.serverId,
            userId: user.id,
        },
        include: {
            user: true,
        }
    });

    if (!currentMember) return redirect('/')

    const conversation = await conversationUtil(currentMember.id, params.memberId);

    if (!conversation) {
        return redirect(`/chat/server/personal`)
    }

    const { memberOne, memberTwo } = conversation;
    const otherMember = memberOne.userId === user.id ? memberTwo: memberOne;


    return (
        <div className='bg-[#313338] flex flex-col h-full'>
            <ChatHeader imageUrl={otherMember!.user!.image!} 
            name={otherMember!.user!.username!}
            serverId={params.serverId}
            type='userDm'/>
            <ChatMessages 
                member={currentMember} 
                name={otherMember.user.username!}
                chatId={conversation.id}
                messageApiUrl={dmApiUrl}
                socketQuery={{ conversationId: conversation.id }}
                paramKey='conversationId'
                paramValue={conversation.id}
                type='userDm'
            />
            <ChatInput 
                apiUrl={messageHandlerApiUrl}
                query={ {conversationId: conversation.id} }                
                name={otherMember.user.username!}
                type='userDm'
            />
        </div>
    )
}

export default MemberIdPage;