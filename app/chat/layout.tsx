import React from "react";
import { Suspense } from "react";

import ChatMainSidebar from "@/components/chat-sidebar-components/chat-main-sidebar";

interface ChatLayoutProps {
    children?: React.ReactNode;
}

const ChatLayout: React.FC<ChatLayoutProps> = async ({
    children,
}: ChatLayoutProps) => {


    return(
        <div className='h-full'>
            <div className="flex h-screen bg-[#313338]">
                <div className='hidden md:flex h-full w-[72px]
                z-30 flex-col fixed inset-y-0'>
                    <ChatMainSidebar />
                </div>
                <section className="flex-1 p-6 overflow-y-auto">
                {children}
                </section>
            </div>
        </div>
        
    )
}

export default ChatLayout