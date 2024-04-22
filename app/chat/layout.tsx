import React from "react";
import { Suspense } from "react";

import ChatMainSidebar from "@/components/chat-sidebar-components/chat-main-sidebar";
import { UserType } from '@/lib/entities/user';
import { getUser } from "@/lib/utils/data/fetching/userData";

interface ChatLayoutProps {
    children?: React.ReactNode;
}

const ChatLayout: React.FC<ChatLayoutProps> = async ({
    children,
}: ChatLayoutProps) => {


    return(
        //Styling wrapper needs to ensure they're rendering side by side
        <div className="flex h-screen">
            <ChatMainSidebar />
            <section className="flex-1 p-6 overflow-y-auto">
            {children}
            </section>
        </div>

        
    )
}

export default ChatLayout