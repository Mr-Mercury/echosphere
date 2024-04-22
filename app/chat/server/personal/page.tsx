import { PageContainer } from "@/components/page-container";
import ChatWindow from "@/components/islet/chat-window"
import { FriendSidebar } from "@/components/contents-sidebar-components/friend-sidebar/friend-sidebar";
import { getUser } from "@/lib/utils/data/fetching/userData";


export default async function Personal() {

    let user = await getUser('1234');

    return (
        <div className='text-white'>
            <section className="flex h-screen">
                <FriendSidebar friends={user.friends} servers={user.servers}/>
            </section>
            <PageContainer>
                <ChatWindow />
            </PageContainer>
        </div>
    )

}

<div>
        <section>
            <ChannelSideBar channels={server.channels} server={server.id}/>
        </section>
        <PageContainer>
            <ChatWindow {...channel}/>
        </PageContainer>
    </div>