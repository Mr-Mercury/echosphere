"use client";

import { useSocket } from "@/components/providers/socket-provider";
import { useTransition } from "react";
import { signOut } from "next-auth/react";

export const SettingsContent = () => {
    const { disconnect } = useSocket();
    const [isPending, startTransition] = useTransition();

    const handleClick = () => {
        console.log('Socket Disconnecting');
        disconnect();

        signOut({
            callbackUrl: '/'
        })
    }

    return (
        <button
            onClick={handleClick}
            disabled={isPending}
        >
            {isPending ? 'Signing out...' : 'Sign out'}
        </button>
    );
}