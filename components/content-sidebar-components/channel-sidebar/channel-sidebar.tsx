import { redirect } from "next/navigation";
import Link from "next/link";
import ServerHeader from "./channel-server-header";
import { auth } from "@/auth";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { getServerChannelsById } from "@/lib/utilities/data/fetching/serverData";
import { ChannelType } from "@prisma/client";

interface ChannelSidebarProps {
    serverId: string;
}

export const ChannelSidebar = async (params: ChannelSidebarProps) => {

    const user = await currentUser();

    if (!user) return redirect('/');

    //I would not be making this kind of request outside of a server component
    //Because it's a waterfall request - but it works out in RSC.  Very nice. 
    const server = await getServerChannelsById(params.serverId, user.id);

    const textChannels = server?.channels.filter((channel) => {
        channel.type === ChannelType.TEXT
    })

    const audioChannels = server?.channels.filter((channel) => {
        channel.type === ChannelType.AUDIO
    })

    if (!server) return redirect('/chat/server/personal');

    const role = server.members.find((member) => member.userId === user.id)?.role;

    return (
        <div className='flex flex-col h-full text-white w-full bg-[#2B2D31]'>
            <ServerHeader server={server} role={role}/>
            {/* <ul>
                {Array.from(channels.map(channel => (
                    <li key={channel.id}>
                        <Link href={`/chat/server/${server.id}/${channel.id}`}>{channel.id}</Link>
                    </li>
                )))}
            </ul> */}
        </div>
    )
}
