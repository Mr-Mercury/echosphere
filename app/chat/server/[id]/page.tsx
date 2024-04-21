import { ServerType } from "@/lib/entities/server"
import { generateRandomServer } from "@/lib/utils/mocking/mock"
import { getServerById } from "@/lib/utils/data/fetching/serverData"
import { PageContainer } from "@/components/page-container"
import ServerDetails from "@/components/islet/chat-window/index";

async function ServerPage({ params, }: {params:{id:string}}) {

    const server = await getServerById(params.id)
    console.log(server);
    return (<div>
        <PageContainer>
            <ServerDetails server={server}/>
        </PageContainer>
    </div>)
}

export default ServerPage; 
