import { ServerType } from "@/lib/entities/server"
import { generateRandomServer } from "@/lib/utils/mocking/mock"
import { getServerById } from "@/lib/utils/data/fetching/serverData"
import { PageContainer } from "@/components/page-container"

function ServerPage(server: ServerType) {
    return (<div>
        <PageContainer>
            <ServerDetails server={server}/>
        </PageContainer>
    </div>)
}

export async function getServerSideProps({ params }: {params: {id:string}}) {
    const server = await getServerById(params.id);

    return { props: { server} };
}

export default ServerPage; 
