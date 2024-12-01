import { FriendSidebar } from "@/components/content-sidebar-components/friend-sidebar/friend-sidebar";

const ChannelLayout = ({ children }: {
    children: React.ReactNode;
}) => {
    return (
        <div className='h-full'>
            <div className='hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0'>
                <FriendSidebar />
            </div>
            <main className='h-full w-full md:pl-60'>
                {children}
            </main>
        </div>
    )
}

export default ChannelLayout;