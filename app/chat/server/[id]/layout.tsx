import { getUser } from "@/lib/utils/data/fetching/userData";
import { getServerById } from "@/lib/utils/data/fetching/serverData";
import { generateRandomChannels } from "@/lib/utils/mocking/mock";
import { redirect } from "next/navigation";
import { ChannelSideBar } from "@/components/contents-sidebar-components/channel-sidebar/channel-sidebar";


const ChannelLayout = async ({ children, params }: {
    children: React.ReactNode,
    params: {id:string},
}) => {

    const user = await getUser('1234');

    // if (!user) {
    //     return redirectsignin()
    // }

    const server = await getServerById(params.id);

    if (!server) {
        return redirect('/')
    }

    return (
        <div className='h-full'>
            <div className='hidden md:flex h-full w-60
            z-20 flex-col fixed inset-y-0'>
                <ChannelSideBar server={params.id}/>
            </div>
            <main className='h-full md:pl-60'>{children}</main>
        </div>
    )
}

export default ChannelLayout;