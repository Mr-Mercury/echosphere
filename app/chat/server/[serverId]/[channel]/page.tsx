import { ChannelSideBar } from "@/components/content-sidebar-components/channel-sidebar/channel-sidebar";
import ChatWindow from "@/components/islets/chat-window";
import { PageContainer } from "@/components/page-container";
import { getChannelById } from "@/lib/utilities/data/fetching/channelData"
import { generateRandomChannels } from "@/lib/utilities/mocking/mock";

async function ChannelPage({params}: {params: {id:string, channel:string}}) {
    const channelData = await getChannelById(params.channel);

    return (
        <div>
            <PageContainer>
                <ChatWindow {...channelData}/>
            </PageContainer>
        </div>
    )
}

export default ChannelPage;