import { UserType } from "@/lib/entities/user"
import { ChannelTypes } from "@/lib/entities/channel";
import { ServerType } from "@/lib/entities/server";
import { generateRandomBot, 
    generateRandomChannels, 
    generateRandomServer } from "@/lib/utils/mocking/mock";
import { FriendSidebar } from "@/components/contents-sidebar-components/friend-sidebar/friend-sidebar"

async function fetchData(): Promise<FetchedData>{
    const friends: UserType[] = generateRandomBot(5);
    const servers: ServerType[] = generateRandomServer(12)
    return { friends, servers }

}

interface FetchedData {
    friends: UserType[];
    servers: ServerType[];
}

const Personal = async () => {
    const data = fetchData();
    return (
        <section className="flex h-screen">
            <FriendSidebar />
            <main className="flex-1 p-6 overflow-y-auto"> Chat Window </main>
        </section>
    )

}

export default Personal