"use client";

import Link from "next/link";
import { useSocket } from "@/components/providers/socket-provider";
import { useTransition } from "react";
import { signOut } from "next-auth/react";
import UserButton, { UserWithImage } from "@/components/islets/users/user-button";
import { Separator } from "@/components/ui/separator";
import { Button as UiButton } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface SettingsNavigationProps {
    user: UserWithImage;
}

const SettingsNavigation = ({ user }: SettingsNavigationProps) => {
    const { disconnect } = useSocket();
    const [isPending, startTransition] = useTransition();

    const handleSignOutClick = () => {
        startTransition(async () => {
            console.log('Socket Disconnecting for sign out');
            if (typeof disconnect === 'function') {
                await disconnect(); 
            }
            signOut({
                callbackUrl: '/'
            });
        });
    };

    return (
        <nav className="space-y-4 flex flex-col items-center p-3 border-r border-zinc-700 w-60 h-full bg-zinc-850">
            <Link href="/chat" legacyBehavior passHref>
                <UiButton variant="ghost" className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-700/50 w-full">
                    <ChevronLeft className="h-5 w-5 mr-1" />
                        Back to Chat
                </UiButton>
            </Link>
            <Separator className='h-[2px] bg-zinc-600 rounded-md w-10 mx-auto my-3'/>
            <div className="flex flex-col gap-1 w-full flex-grow">
                <Link href="/settings/profile" className="text-zinc-400 hover:text-zinc-200 transition px-3 py-1.5 rounded-md hover:bg-zinc-700 text-sm">
                    Manage Profile
                </Link>
                <Link href="/settings/notifications" className="text-zinc-400 hover:text-zinc-200 transition px-3 py-1.5 rounded-md hover:bg-zinc-700 text-sm">
                    Manage API Keys
                </Link>                
                <Link href="/settings/usage" className="text-zinc-400 hover:text-zinc-200 transition px-3 py-1.5 rounded-md hover:bg-zinc-700 text-sm">
                    Usage Statistics
                </Link>
                <Link href="/settings/billing" className="text-zinc-400 hover:text-zinc-200 transition px-3 py-1.5 rounded-md hover:bg-zinc-700 text-sm">
                    Billing
                </Link>
                <Link href="/settings/account" className="text-zinc-400 hover:text-zinc-200 transition px-3 py-1.5 rounded-md hover:bg-zinc-700 text-sm">
                    Account Settings
                </Link>
                <Link href="/settings/privacy" className="text-zinc-400 hover:text-zinc-200 transition px-3 py-1.5 rounded-md hover:bg-zinc-700 text-sm">
                    Privacy & Safety
                </Link>
                <Link href="/settings/themes" className="text-zinc-400 hover:text-zinc-200 transition px-3 py-1.5 rounded-md hover:bg-zinc-700 text-sm">
                    Themes (WIP)
                </Link>
            </div>
            <Separator className='h-[2px] bg-zinc-600 rounded-md w-10 mx-auto mt-auto mb-3'/>
            <UiButton 
                variant="ghost" 
                className="text-zinc-400 hover:text-red-500 transition border-transparent hover:border-red-500 border-2 rounded-md px-3 py-1.5 w-full hover:bg-red-500/10 text-sm"
                onClick={handleSignOutClick}
                disabled={isPending}
            >
                {isPending ? 'Signing out...' : 'Sign out'}
            </UiButton>
        </nav>
    );
}

export default SettingsNavigation;