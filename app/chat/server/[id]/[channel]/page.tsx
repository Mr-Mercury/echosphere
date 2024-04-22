import { ChannelSideBar } from "@/components/contents-sidebar-components/channel-sidebar/channel-sidebar";
import ChatWindow from "@/components/islet/chat-window";
import { PageContainer } from "@/components/page-container";
import { getChannelById } from "@/lib/utils/data/fetching/channelData"
import { generateRandomChannels } from "@/lib/utils/mocking/mock";

async function ChannelPage({params}: {params: {id:string, channel:string}}) {
    console.log(params);
    const channelData = await getChannelById(params.channel);
    const channels = await generateRandomChannels(5);

    return (
        <div>
            <ChannelSideBar channels={channels} server={params.id}/>
            <PageContainer>
                <ChatWindow {...channelData}/>
            </PageContainer>
        </div>
    )
}

export default ChannelPage;