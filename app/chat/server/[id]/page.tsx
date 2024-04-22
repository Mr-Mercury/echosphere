import { ServerType } from "@/lib/entities/server"
import { generateRandomServer } from "@/lib/utils/mocking/mock"
import { getServerById } from "@/lib/utils/data/fetching/serverData"
import { PageContainer } from "@/components/page-container"
import ChatWindow from "@/components/islet/chat-window"
import { ChannelSideBar } from "@/components/contents-sidebar-components/channel-sidebar/channel-sidebar"
import { getChannelById } from "@/lib/utils/data/fetching/channelData"

async function ServerPage({ params, }: {params:{id:string}}) {

    const server = await getServerById(params.id);
    const channel = await getChannelById(params.id);
    // TODO: Pass channels to ChannelSideBar, 
    // Pass server content to serverChat
    // Fuck it I'll store everything in state. 
    return (<div>
        <section>
            <ChannelSideBar channels={server.channels} server={server.id}/>
        </section>
        <PageContainer>
            <ChatWindow {...channel}/>
        </PageContainer>
    </div>)
}


export default ServerPage; 
