'use client'

import { ServerType } from "@/lib/entities/server";

interface ServerHeaderProps {
    server: ServerType;
    role?: 'admin' | 'common';
}

const ServerHeader = ({
    server, role
}: ServerHeaderProps) => {
    return (
        <div>
            Hey
        </div>
    )
}

export default ServerHeader;