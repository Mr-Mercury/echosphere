import { ServerType } from "@/lib/entities/server"
import { generateRandomServer } from "@/lib/utils/mocking/mock"
import { getServerById } from "@/lib/utils/data/fetching/serverData"
import { PageContainer } from "@/components/page-container"
import ServerChat from "@/components/islet/chat-window"
import { ChannelSideBar } from "@/components/contents-sidebar-components/channel-sidebar/channel-sidebar"

async function ServerPage({ params, }: {params:{id:string}}) {

    const server = await getServerById(params.id);
    // TODO: Pass channels to ChannelSideBar, 
    // Pass server content to serverChat
    // Fuck it I'll store everything in state. 
    return (<div>
        <section>
            <ChannelSideBar />
        </section>
        <PageContainer>
            <ServerChat {...server}/>
        </PageContainer>
    </div>)
}

export default ServerPage; 
