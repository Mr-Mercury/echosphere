import { PageContainer } from "@/components/page-container";
import ChatWindow from "@/components/islets/chat-window"
import { FriendSidebar } from "@/components/content-sidebar-components/friend-sidebar/friend-sidebar";
import { auth } from "@/auth";


export default async function Personal() {

    let session = await auth();
    let user = session?.user;

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