import React from "react";
import { Suspense } from "react";

import { ChatMainSidebar } from "@/components/chat-sidebar-components/chat-sidebar";
import { UserType } from '@/lib/entities/user';

interface ChatLayoutProps {
    children?: React.ReactNode;
    currentUser: UserType;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({
    children, currentUser
}: ChatLayoutProps) => {
    return(
        //Styling wrapper needs to ensure they're rendering side by side
        <div className="flex h-screen">
            <ChatMainSidebar currentUser={currentUser} />
            <main className="flex-1 p-6 overflow-y-auto">
            {children}
            </main>
        </div>

        
    )
}

export default ChatLayout