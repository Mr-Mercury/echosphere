import ChatWindow from "@/components/islets/chat-window";
import { PageContainer } from "@/components/page-container";
import { getServerChannelsById } from "@/lib/utilities/data/fetching/serverData";

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