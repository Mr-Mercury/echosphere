import { redirect } from "next/navigation";
import ServerHeader from "./channel-server-header";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { getServerChannelsById } from "@/lib/utilities/data/fetching/serverData";
import { ChannelType, MemberRole } from "@prisma/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import ServerSearch from "@/components/islets/search/server-search";
import { Hash, Mic2, ShieldAlert, ShieldCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ServerListing } from "@/components/islets/section/server-listing";
import { ChannelItem } from "@/components/islets/chat-window/channel-item";
import { MemberList } from "@/components/islets/chat-window/member-list";

interface ChannelSidebarProps {
    serverId: string;
}

const iconMap = {
    [ChannelType.TEXT]: <Hash className='mr-2 h-4 w-4' />,
    [ChannelType.AUDIO]: <Mic2 className='mr-2 h-4 w-4' />,
}

const roleIconMap = {
    [MemberRole.GUEST]: null,
    [MemberRole.MODERATOR]: <ShieldCheck className='h-4 w-4 mr-2 text-indigo-500' />,
    [MemberRole.ADMIN]: <ShieldAlert className='h-4 w-4 mr-2 text-rose-500' />,
}

export const ChannelSidebar = async (params: ChannelSidebarProps) => {

    const user = await currentUser();

    if (!user) return redirect('/');

    //I would not be making this kind of request outside of a server component
    //Because it's a waterfall request - but it works out in RSC.  Very nice. 
    const server = await getServerChannelsById(params.serverId, user.id);

    const textChannels = server?.channels.filter((channel) => {
        return channel.type === ChannelType.TEXT
    })

    const audioChannels = server?.channels.filter((channel) => {
        return channel.type === ChannelType.AUDIO
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
            {/* TODO: MOVE THIS TO UPPER BAR LIKE DISCORD? */}
            <ScrollArea className='flex-1 px-3'>
                <div className='mt-2'>
                    <ServerSearch 
                        data={[
                            {
                                label: 'Text Channels',
                                type: 'channel',
                                data: textChannels?.map((channel) => ({
                                    id: channel.id,
                                    name: channel.name,
                                    icon: iconMap[channel.type],
                                }))
                            },
                            {
                                label: 'Audio Channels',
                                type: 'channel',
                                data: audioChannels?.map((channel) => ({
                                    id: channel.id,
                                    name: channel.name,
                                    icon: iconMap[channel.type],
                                }))
                            },
                            {
                                label: 'Members',
                                type: 'member',
                                data: server.members?.map((member) => ({
                                    id: member.id,
                                    name: member.user.username!,
                                    icon: roleIconMap[member.role],
                                }))
                            }
                        ]}/>
                </div>
                <Separator className='bg-zinc-700 rounded-md my-2'/>
                {!!textChannels?.length && (
                    <div className='mb-2'>
                        <ServerListing 
                            sectionType='channels' 
                            channelType={ChannelType.TEXT}
                            role={role}
                            label='Text Channels'
                        />
                        {textChannels.map((channel) => (
                            <ChannelItem key={channel.id}
                            channel={channel}
                            role={role}
                            server={server} 
                            />
                        ))}
                    </div>
                )}
                {!!audioChannels?.length && (
                    <div className='mb-2'>
                        <ServerListing 
                            sectionType='channels' 
                            channelType={ChannelType.TEXT}
                            role={role}
                            label='Voice Channels'
                        />
                        {audioChannels.map((channel) => (
                            <ChannelItem key={channel.id}
                            channel={channel}
                            role={role}
                            server={server} 
                            />
                        ))}
                    </div>
                )}
                <MemberList server={server} role={role} />
            </ScrollArea>
        </div>
    )
}
