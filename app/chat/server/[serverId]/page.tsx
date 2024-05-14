import { ServerType } from "@/lib/entities/server"
import { generateRandomServer } from "@/lib/utilities/mocking/mock"
import { getServerById } from "@/lib/utilities/data/fetching/serverData"
import { PageContainer } from "@/components/page-container"
import ChatWindow from "@/components/islets/chat-window"
import { ChannelSideBar } from "@/components/content-sidebar-components/channel-sidebar/channel-sidebar"
import { getChannelById } from "@/lib/utilities/data/fetching/channelData"

async function ServerPage({ params, }: {params:{id:string}}) {

    // TODO: Pass channels to ChannelSideBar, 
    // Pass server content to serverChat
    // Fuck it I'll store everything in state. 
    return (<div>SERVER
        {/* <section>
            <ChannelSideBar channels={server.channels} server={server.id}/>
        </section>
        <PageContainer>
            <ChatWindow />
        </PageContainer> */}
    </div>)
}


export default ServerPage; 
