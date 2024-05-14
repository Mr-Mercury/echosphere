import { getServerById } from "@/lib/utilities/data/fetching/serverData";
import { redirect } from "next/navigation";
import { ChannelSideBar } from "@/components/content-sidebar-components/channel-sidebar/channel-sidebar";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";

const ChannelLayout = async ({
    children, params,
}: {
    children: React.ReactNode;
    params: { serverId: string }
}) => {

    const user = await currentUser();

    if (!user) {
        return redirect('/login')
    }

    const server = await getServerById(params.serverId, user.id);

    if (!server) {
        return redirect('/chat/server/personal')
    }

    return (
        <div>
            <div>
                Server Sidebar
            </div>
            <main className='h-full md:pl-60'>
                {children}
            </main>
        </div>
    )
}


export default ChannelLayout;


// const ChannelLayout = async ({ children, params }: {
//     children: React.ReactNode,
//     params: {id:string},
// }) => {

//     const server = await getServerById(params.id);

//     if (!server) {
//         return redirect('/')
//     }

//     return (
//         <div className='h-full'>
//             <div className='hidden md:flex h-full w-60
//             z-20 flex-col fixed inset-y-0'>
//                 <ChannelSideBar server={server}/>
//             </div>
//             <main className='h-full md:pl-60'>{children}</main>
//         </div>
//     )
// }

// export default ChannelLayout;