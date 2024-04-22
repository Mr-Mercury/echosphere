import { SingleChannel } from "@/lib/entities/channel";
import Link from "next/link";


export const ChannelSideBar = (data: {channels: SingleChannel[], server:string}) => {
    const {channels, server} = data;
    
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
