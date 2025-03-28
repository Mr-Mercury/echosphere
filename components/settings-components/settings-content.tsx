"use client";

import { useSocket } from "@/components/providers/socket-provider";
import { useTransition } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";

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
        <div className="flex flex-col justify-center items-center gap-2">
            <Link href={`/settings/profile`}>
                <button 
                className="text-zinc-400 hover:text-zinc-200 transition 
                border-transparent hover:border-zinc-200 border-2 rounded-md px-2 py-1">
                    Manage Profile
                </button>
            </Link>
            <Link href={`/settings/billing`}>
                <button 
                className="text-zinc-400 hover:text-zinc-200 transition 
                border-transparent hover:border-zinc-200 border-2 rounded-md px-2 py-1">
                    Billing
                </button>
            </Link>
            <button className="text-zinc-400 hover:text-zinc-200 transition border-transparent hover:border-zinc-200 border-2 rounded-md px-2 py-1"
                onClick={handleClick}
                disabled={isPending}
            >
            {isPending ? 'Signing out...' : 'Sign out'}
            </button>
        </div>
    );
}