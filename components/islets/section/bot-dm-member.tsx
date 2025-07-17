'use client'

import { UserAvatar } from "../users/user-avatar"

interface BotDmMemberProps {
    id: string;
    avatar: string;
    username: string;
    onClick: (id: string) => void;
}

export const BotDmMember = ({ id, avatar, username, onClick }: BotDmMemberProps) => {
    return (
        <button
            onClick={() => onClick(id)}
            className='flex items-center space-x-2 p-2 rounded-md hover:bg-zinc-700 w-full'
        >
            <UserAvatar src={avatar} />
            <span className='text-sm text-zinc-300'>{username}</span>
        </button>
    )
} 