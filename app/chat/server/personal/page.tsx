import { PageContainer } from "@/components/page-container";
import ChatWindow from "@/components/islets/chat-window"
import { FriendSidebar } from "@/components/content-sidebar-components/friend-sidebar/friend-sidebar";
import { getUser } from "@/lib/utils/data/fetching/userData";


export default async function Personal() {

    let user = await getUser('1234');

    return (
        <div>
            <section className="flex h-screen">
                <FriendSidebar friends={user.friends} servers={user.servers}/>
            </section>
            <PageContainer>
                <ChatWindow />
            </PageContainer>
        </div>
    )

}