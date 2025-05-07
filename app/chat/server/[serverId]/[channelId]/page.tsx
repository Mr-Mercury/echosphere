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
    const apiUrl = process.env.NEXT_PUBLIC_MESSAGE_HANDLER_URL as string;

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
            <div className='flex-1 flex flex-col overflow-hidden'>
                <div className='flex-1 overflow-y-auto'>
                    <ChatMessages 
                        member={member} 
                        name={channel.name} 
                        type='channel'
                        chatId={channel.id}
                        messageApiUrl={messageApiUrl} 
                        socketQuery={{ channelId: channel.id, serverId: channel.serverId }}
                        paramKey='channelId'
                        paramValue={channel.id}
                    />
                </div>
                <div className='flex-shrink-0'>
                    <ChatInput 
                        name={channel.name} 
                        type='channel' 
                        apiUrl={apiUrl} 
                        query={{channelId: channel.id, serverId: channel.serverId}}
                    />
                </div>
            </div>
        </div>
    )
}

export default ChannelIdPage;