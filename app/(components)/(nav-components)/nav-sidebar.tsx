import React from "react";

// Type chosen because it can be combined with other types. 
type NavSidebarProps = {
    children?: React.ReactNode;
    currentUser: any;
}

export const NavSidebar: React.FC<NavSidebarProps> = async ({currentUser}) => {
    return (
        <div>Nav Side</div>
    )
}
