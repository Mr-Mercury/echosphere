'use client';

import { Member, MemberRole, User } from "@prisma/client";
import { UserAvatar } from "../islets/users/user-avatar";
import NavTooltip from "../chat-sidebar-components/nav-tooltip";
import { ShieldAlert, ShieldCheck } from "lucide-react";

interface ChatItemProps {
    id: string;
    content: string;
    member: Member & {
        user: User;
    };
    timestamp: string;
    fileUrl: string | null;
    deleted: boolean;
    currentMember: Member;
    isUpdated: boolean;
    messageApiUrl: string;
    socketQuery: Record<string, string>;
}

const roleIconMap = {
    'GUEST': null,
    'MODERATOR': <ShieldCheck className='w-4 h-4 ml-2 text-indigo-500' />,
    'ADMIN': <ShieldAlert className='w-4 h-4 ml-2 text-rose-500' />,
}

export const ChatItem = ({
    id, content, member, timestamp, fileUrl, deleted, 
    currentMember, isUpdated,
    messageApiUrl, socketQuery
}: ChatItemProps) => {
    const isAdmin = currentMember.role === MemberRole.ADMIN;
    const isModerator = currentMember.role === MemberRole.MODERATOR;
    const isOwner = currentMember.id === member.id;
    const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner)
    const canEditMessage = !deleted && isOwner;
    

    return (
        <div className='relative group flex items-center hover:bg-black/5 p-4 transition w-full'>
            <div className='group flex gap-x-2 items-start w-full'>
                <div className='cursor-pointer hover:drop-shadow-md transition'>
                    <UserAvatar src={member.user.image!}/>
                </div>
                <div className='flex flex-col w-full'>
                    <div className='flex items-center gap-x-2'>
                        <div className='flex items-center'>
                            <p className='font-semibold text-sm hover:underline cursor-pointer'>
                                {member.user.username}
                            </p>
                            <NavTooltip label={member.role}>
                                {roleIconMap[member.role]}
                            </NavTooltip>
                        </div>
                        <span className='text-xs text-zinc-400'>
                            {timestamp}
                        </span>
                    </div>
                    {content}
                </div>
            </div>
        </div>
    )
}