import React from "react";
import { Suspense } from "react";

import { NavSidebar } from '../(components)/(nav-components)/nav-sidebar';
import { UserType } from '@/lib/entities/user';

interface ChatLayoutProps {
    children?: React.ReactNode;
    currentUser: UserType;
}

export default function ChatLayout({
    currentUser,
    ...children
}: ChatLayoutProps): JSX.Element{
    return (
        <div>
            <Suspense fallback=
            <NavSidebar currentUser={currentUser} />
        </div>
    )
}