import ChatHeader from "@/components/message-window/chat-header";
import { ChatInput } from "@/components/message-window/chat-input";
import { db } from "@/lib/db/db";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { redirect } from "next/navigation";

interface ChannelIdPageProps {
    params: {
        serverId: string;
        channelId: string;
    }
}

const ChannelIdPage = async ({params}: ChannelIdPageProps) => {

    const user = await currentUser();
    if (!user) return redirect('/login');

    const channel = await db.channel.findUnique({
        where: {
            id: params.channelId,
        },
    });

    const member = await db.member.findFirst({
        where: {
            serverId: params.serverId,
            userId: user.id,
        }
    });

    if (!channel || !member) return redirect('/chat/server/personal')
    return (
        <div className='bg-[#313338] flex flex-col h-full'>
            <ChatHeader name={channel.name} serverId={channel.serverId} type='channel'/>
            <div className='flex-1'>Messages Go Here</div>
            <ChatInput name={channel.name} type='channel' apiUrl='/api/socket/messages' query={ {channelId: channel.id, serverId: channel.serverId} }/>
        </div>
    )
}

export default ChannelIdPage;