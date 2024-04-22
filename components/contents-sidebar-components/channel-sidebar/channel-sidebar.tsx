import { SingleChannel } from "@/lib/entities/channel";
import Link from "next/link";


export const ChannelSideBar = (data: {channels: SingleChannel[], serverId:string}) => {
    const {channels, serverId} = data;
    return (
        <ul>
            {Array.from(channels.map(channel => (
                <li key={channel.id}>
                    <Link href={`/chat/server/${serverId}/${channel.id}`}>{channel.id}</Link>
                </li>
            )))}
        </ul>
    )
}
