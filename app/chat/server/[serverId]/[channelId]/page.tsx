import ChatHeader from "@/components/message-window/chat-header";
import ChatInput from "@/components/message-window/chat-input";
import ChatMessages from "@/components/message-window/chat-messages";
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
    const messageApiUrl = process.env.NEXT_PUBLIC_MESSAGE_API_URL as string;
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
            <ChatMessages 
            member={member} name={channel.name} type='channel'
            chatId={channel.id}
            messageApiUrl={messageApiUrl} 
            socketQuery={{ channelId: channel.id, serverId: channel.serverId }}
            paramKey='channelId'
            paramValue={channel.id}
             />
            <ChatInput name={channel.name} type='channel' apiUrl='http://localhost:4000/message' query={ {channelId: channel.id, serverId: channel.serverId} }/>
        </div>
    )
}

export default ChannelIdPage;