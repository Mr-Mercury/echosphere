'use client';

import { Member, User } from "@prisma/client";
import { UserAvatar } from "../islets/users/user-avatar";

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

export const ChatItem = ({
    id, content, member, timestamp, fileUrl, deleted, 
    currentMember, isUpdated,
    messageApiUrl, socketQuery
}: ChatItemProps) => {

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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}