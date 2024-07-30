'use client';

import { useChatQuery } from "@/hooks/use-chat-query";
import ChatWelcome from "./chat-welcome";
import { Loader2 } from "lucide-react";

interface ChatMessagesProps {
    name: string;
    member: Member;
    chatId: string;
    messageApiUrl: string;
    socketQuery: Record<string, string>;
    paramKey: 'channelId' | 'conversationId';
    paramValue: string;
    type: 'channel' | 'dm';
}

const ChatMessages = ({
    name, 
    member, 
    chatId, 
    messageApiUrl, 
    socketQuery,
    paramKey, 
    paramValue,
    type
}: ChatMessagesProps) => {
    const queryKey = `chat:${chatId}`
    const {data, fetchNextPage, hasNextPage, isFetchingNextPage, status} = useChatQuery({
        queryKey,
        paramKey,
        paramValue,
    })

    if (status === 'pending') {
        return (
            <div className='flex flex-col flex-1 justify-center items-center'>
                <Loader2 className='h-7 w-7 text-zinc-400 animate-spin my-4'/>
                <p className='text-xs text-zinc-400'>
                    Loading....
                </p>
            </div>
        )
    }
    return (
        <div className='flex-1 flex flex-col py-4 overflow-y-auto'>
            <div className='flex-1'/>
            <ChatWelcome type={type} name={name} />
        </div>
    )
}

export default ChatMessages;