import { ChannelSideBar } from "@/components/contents-sidebar-components/channel-sidebar/channel-sidebar";
import ChatWindow from "@/components/islet/chat-window";
import { PageContainer } from "@/components/page-container";
import { getChannelById } from "@/lib/utils/data/fetching/channelData"
import { generateRandomChannels } from "@/lib/utils/mocking/mock";

async function ChannelPage({params}: {params: {id:string, channel:string}}) {
    const channelData = await getChannelById(params.channel);

    return (
        <div>
            <PageContainer>
                CHANNEL
                <ChatWindow {...channelData}/>
            </PageContainer>
        </div>
    )
}

export default ChannelPage;