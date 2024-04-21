import { ServerType } from "@/lib/entities/server"
import { generateRandomServer } from "@/lib/utils/mocking/mock"
import { getServerById } from "@/lib/utils/data/fetching/serverData"
import { PageContainer } from "@/components/page-container"
import ServerChat from "@/components/islet/chat-window"
import { ChannelSideBar } from "@/components/contents-sidebar-components/channel-sidebar/channel-sidebar"

async function ServerPage({ params, }: {params:{id:string}}) {

    const server = getServerById(params.id);
    console.log(server);
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
