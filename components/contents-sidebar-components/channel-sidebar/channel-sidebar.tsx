import { SingleChannel } from "@/lib/entities/channel";
import { generateRandomChannels } from "@/lib/utils/mocking/mock";

import Link from "next/link";


export const ChannelSideBar = (params: {server:string}) => {
    const {server} = params; 
    const channels = generateRandomChannels(8);
    
    return (
        <ul>
            {Array.from(channels.map(channel => (
                <li key={channel.id}>
                    <Link href={`/chat/server/${server}/${channel.id}`}>{channel.id}</Link>
                </li>
            )))}
        </ul>
    )
}
