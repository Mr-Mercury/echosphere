import React from "react";

import {NavSidebar} from '../(components)/(nav-components)/nav-sidebar';

interface ChatLayoutProps {
    children: React.ReactNode;
    currentUser: any;
}

export default function ChatLayout({
    currentUser,
    ...children
}: ChatLayoutProps): JSX.Element{
    return (
        <div>
            <NavSidebar currentUser={currentUser}></NavSidebar>
        </div>
    )
}