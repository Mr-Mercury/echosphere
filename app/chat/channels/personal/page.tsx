import { UserType } from "@/lib/entities/user"
import { ChannelTypes } from "@/lib/entities/channel";
import { ServerType } from "@/lib/entities/server";
import { generateRandomBot, 
    generateRandomChannels, 
    generateRandomServer } from "@/lib/utils/mocking/mock";
import { FriendSidebar }

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
        <div>DATA</div>
    )

}

export default Personal