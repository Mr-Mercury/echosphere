import { SingleChannel } from "@/lib/entities/channel";
import { generateRandomBot, generateRandomChannels } from "@/lib/utilities/mocking/mock";
import { getUser } from "@/lib/utilities/data/fetching/userData";
import { redirect } from "next/navigation";
import Link from "next/link";
import ServerHeader from "./channel-server-header";
import { ServerType } from "@/lib/entities/server";
import { auth } from "@/auth";

interface ChannelSidebarProps {
    server: ServerType;
}

export const ChannelSideBar = async (params: ChannelSidebarProps) => {
    const {server} = params; 
    const session = await auth();
    const user = session?.user;

    if (!user || !server) {
        return redirect('/')
    }


    // in reality you get the server by fetching from the server db
    const channels = await generateRandomChannels(8);

    // FIX LATER
    const publicChannels = channels;
    const privateChannels = [];
    const members = generateRandomBot(10); 

    const role = 'admin' 

    return (
        <div className='flex flex-col h-full text-white w-full bg-[#2B2D31]'>
            <ServerHeader server={server} role='admin'/>
            <ul>
                {Array.from(channels.map(channel => (
                    <li key={channel.id}>
                        <Link href={`/chat/server/${server.id}/${channel.id}`}>{channel.id}</Link>
                    </li>
                )))}
            </ul>
        </div>
    )
}
