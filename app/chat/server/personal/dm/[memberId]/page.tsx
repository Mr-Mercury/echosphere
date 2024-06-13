import ChatHeader from "@/components/message-window/chat-header";
import { db } from "@/lib/db/db";
import { conversationUtil } from "@/lib/utilities/conversation";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { redirect } from "next/navigation";

// TODO: Change to friendId???? current implementation based on servers...
interface MemberIdPageProps {
    params: {
        memberId: string;
        serverId: string;
    }
}

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
            <ChatHeader imageUrl={otherMember.user.image} 
            name={otherMember.user.username}
            serverId={params.serverId}
            type='dm'/>
        </div>
    )
}

export default MemberIdPage;