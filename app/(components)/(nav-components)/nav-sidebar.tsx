import React from "react";

interface NavSidebarProps {
    currentUser: any,
}

export const NavSidebar: React.FC<NavSidebarProps> = async ({currentUser}) => {
    return (
        <div>Nav Side</div>
    )
}
