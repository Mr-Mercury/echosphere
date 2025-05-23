"use client";

import Link from "next/link";
import { useSocket } from "@/components/providers/socket-provider";
import { useTransition } from "react";
import { signOut } from "next-auth/react";

const SettingsNavigation = () => {
    const { disconnect } = useSocket();
    const [isPending, startTransition] = useTransition();

    const handleSignOutClick = () => {
        startTransition(async () => {
            console.log('Socket Disconnecting for sign out');
            // Ensure disconnect is a function and callable, provide a fallback if necessary
            if (typeof disconnect === 'function') {
                await disconnect(); 
            }
            signOut({
                callbackUrl: '/'
            });
        });
    };

    return (
        <nav className="flex flex-col justify-between gap-2 p-4 border-r border-zinc-700 w-64 h-full bg-zinc-850">
            <div className="flex flex-col gap-2">
                <Link href="/settings/profile" className="text-zinc-400 hover:text-zinc-200 transition px-2 py-1 rounded-md hover:bg-zinc-700">
                    Manage Profile
                </Link>
                <Link href="/settings/account" className="text-zinc-400 hover:text-zinc-200 transition px-2 py-1 rounded-md hover:bg-zinc-700">
                    Account Settings
                </Link>
                <Link href="/settings/notifications" className="text-zinc-400 hover:text-zinc-200 transition px-2 py-1 rounded-md hover:bg-zinc-700">
                    Manage API Keys
                </Link>
                <Link href="/settings/appearance" className="text-zinc-400 hover:text-zinc-200 transition px-2 py-1 rounded-md hover:bg-zinc-700">
                    Appearance
                </Link>
                <Link href="/settings/privacy" className="text-zinc-400 hover:text-zinc-200 transition px-2 py-1 rounded-md hover:bg-zinc-700">
                    Privacy & Safety
                </Link>
                <Link href="/settings/billing" className="text-zinc-400 hover:text-zinc-200 transition px-2 py-1 rounded-md hover:bg-zinc-700">
                    Billing
                </Link>
                <Link href="/settings/themes" className="text-zinc-400 hover:text-zinc-200 transition px-2 py-1 rounded-md hover:bg-zinc-700">
                    Themes (WIP)
                </Link>
                {/* Add other categories here as needed */}
            </div>
            <button 
                className="mt-auto text-zinc-400 hover:text-red-500 transition border-transparent hover:border-red-500 border-2 rounded-md px-2 py-1 w-full hover:bg-red-500/10"
                onClick={handleSignOutClick}
                disabled={isPending}
            >
                {isPending ? 'Signing out...' : 'Sign out'}
            </button>
        </nav>
    );
}

export default SettingsNavigation;