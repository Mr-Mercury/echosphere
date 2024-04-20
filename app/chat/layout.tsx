import React from "react";
import { Suspense } from "react";

import { ChatSidebar } from "@/components/chat-sidebar-components/chat-sidebar";
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
        <section>
            <ChatSidebar currentUser={currentUser} />
            <nav></nav>
            {children}
        </section>

        
    )
}

export default ChatLayout