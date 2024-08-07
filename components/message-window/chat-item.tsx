'use client';

import { Member, MemberRole, User } from "@prisma/client";
import { UserAvatar } from "../islets/users/user-avatar";
import NavTooltip from "../chat-sidebar-components/nav-tooltip";
import { FileIcon, ShieldAlert, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

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
    const [isEditing, useIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const fileType = fileUrl?.split('.').pop();
    const isAdmin = currentMember.role === MemberRole.ADMIN;
    const isModerator = currentMember.role === MemberRole.MODERATOR;
    const isOwner = currentMember.id === member.id;
    const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner)
    const canEditMessage = !deleted && isOwner;
    const isPDF = fileType === 'pdf' && fileUrl;
    const isImage = !isPDF && fileUrl;

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
                    {isImage && (
                        <a href={fileUrl} target='_blank' rel='noopener noreferrer'
                            className='relative aspect-square rounded-md mt-2 overflow-hidden border 
                            flex items-center bg-primary h-48 w-48'>
                            <Image src={fileUrl} alt={content} layout='fill' className='object-cover'/>
                        </a>
                    )}
                    {isPDF && (
                        <div className='relative flex items-center p-2 mt-2 rounded-md
                        bg-background/10'>
                            <FileIcon className='h-10 w-10 fill-indigo-200 stroke-indigo-400' />
                            <a href={fileUrl} target='_blank' rel='noopener noreferrer' className='ml-2 text-sm text-indigo-400 hover:underline'>
                                PDF file
                            </a>
                        </div>
                    )}
                    {!fileUrl && !isEditing && (
                        <p>
                            {content}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}