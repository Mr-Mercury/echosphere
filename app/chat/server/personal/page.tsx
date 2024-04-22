import { UserType } from "@/lib/entities/user";
import { useAtom } from "jotai";
import { userDataAtom } from "@/lib/entities/atoms/userDataAtom";
import { ChannelTypes } from "@/lib/entities/channel";
import { ServerType } from "@/lib/entities/server";
import { generateRandomBot, 
    generateRandomChannels, 
    generateRandomServer } from "@/lib/utils/mocking/mock";
import { FriendSidebar } from "@/components/contents-sidebar-components/friend-sidebar/friend-sidebar";
import { getUser } from "@/lib/utils/data/fetching/userData";


export default async function Personal() {

    let user = await getUser('1234');

    return (
        <section className="flex h-screen">
            <FriendSidebar friends={user.friends} servers={user.servers}/>
            <main className="flex-1 p-6 overflow-y-auto"> Friend Chat Window </main>
        </section>
    )

}
