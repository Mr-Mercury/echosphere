import React from "react";
import { Suspense } from "react";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { redirect } from "next/navigation";

import ChatMainSidebar from "@/components/chat-sidebar-components/chat-main-sidebar";

interface ChatLayoutProps {
    children?: React.ReactNode;
}

const ChatLayout: React.FC<ChatLayoutProps> = async ({
    children,
}: ChatLayoutProps) => {

    const user = await currentUser();
    if (!user) return redirect('/')
    
    return(
        <div className='h-full'>
            <div className="flex h-screen bg-[#313338]">
                <div className='hidden md:flex h-full w-[72px]
                z-30 flex-col fixed inset-y-0'>
                    <ChatMainSidebar />
                </div>
                <main className='md:pl-[72px] h-full'>
                    {children}
                </main>
            </div>
        </div>
        
    )
}

export default ChatLayout