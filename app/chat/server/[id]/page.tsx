import { ServerType } from "@/lib/entities/server"
import { generateRandomServer } from "@/lib/utils/mocking/mock"
import { getServerById } from "@/lib/utils/data/fetching/serverData"
import { PageContainer } from "@/components/page-container"
import ServerChat from "@/components/islet/chat-window"

async function ServerPage({ params, }: {params:{id:string}}) {

    const server: ServerType = await getServerById(params.id)
    
    return (<div>
        <PageContainer>
            <ServerChat server={server}/>
        </PageContainer>
    </div>)
}

export default ServerPage; 
