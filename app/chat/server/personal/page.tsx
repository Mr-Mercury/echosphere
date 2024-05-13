import { PageContainer } from "@/components/page-container";
import ChatWindow from "@/components/islets/chat-window"
import { FriendSidebar } from "@/components/content-sidebar-components/friend-sidebar/friend-sidebar";
import { auth, signOut } from "@/auth";


export default async function Personal() {

    let session = await auth();
    let user = session?.user;

    return (
        <div>
            <section className="flex h-screen">
                <FriendSidebar friends={user.friends} servers={user.servers}/>
            </section>
            <PageContainer />

            <div className=''>
                    <form action={async () => {
                        "use server";
                        await signOut();
                    }}>
                        <button type='submit'>
                            Sign out
                        </button>
                    </form>
                </div>
        </div>
    )

}