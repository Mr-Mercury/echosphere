import React from "react";
import { Suspense } from "react";

import ChatMainSidebar from "@/components/chat-sidebar-components/chat-sidebar";
import { UserType } from '@/lib/entities/user';
import { fakeUser } from "@/lib/utils/mocking/mock";

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
            <ChatMainSidebar {...fakeUser} />
            <section className="flex-1 p-6 overflow-y-auto">
            {children}
            </section>
        </div>

        
    )
}

export default ChatLayout