import { currentUser } from "@/lib/utilities/data/fetching/currentUser";

interface ChannelIdPageProps {
    params: {
        serverId: string;
        channelId: string;
    }
}

const ChannelIdPage = async ({params}: ChannelIdPageProps) => {

    const user = await currentUser();

    
    return (
        <div>
            Channel ID
        </div>
    )
}

export default ChannelIdPage;