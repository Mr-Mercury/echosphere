'use client';

import { useChatQuery } from "@/hooks/use-chat-query";
import ChatWelcome from "./chat-welcome";
import { Loader2, ServerCrash } from "lucide-react";
import { Member, Message, User } from "@prisma/client";
import { Fragment } from "react";
import { ChatItem } from "./chat-item";
import { format } from 'date-fns';
import { useChatSocket } from "@/hooks/use-chat-socket";

const DATE_FORMAT = 'd MMM yyyy, HH:mm';

const formatMessageDate = (date: Date | string | null) => {
    if (!date) return '';
    
    try {
        return format(new Date(date), DATE_FORMAT);
    } catch (error) {
        console.error('Date formatting error:', error);
        return '';
    }
}
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

type MessageWithMemberWithUser = Message & {
    member: Member & {
        user: User
    }
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

    const queryKey = `chat:${chatId}`;
    const addKey = `chat:${chatId}:messages`;
    const updateKey = `chat:${chatId}:messages:update`;

    const {data, fetchNextPage, hasNextPage, isFetchingNextPage, status} = useChatQuery({
        queryKey,
        messageApiUrl,
        paramKey,
        paramValue,
    });
    useChatSocket({ queryKey, addKey, updateKey })

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

    if (status === 'error') {
        return (
            <div className='flex flex-col flex-1 justify-center items-center'>
                <ServerCrash className='h-7 w-7 text-zinc-400 my-4'/>
                <p className='text-xs text-zinc-400'>
                    Something exploded, currently putting out fires...
                </p>
            </div>
        )
    }

    return (
        <div className='flex-1 flex flex-col py-4 overflow-y-auto'>
            <div className='flex-1'/>
            <ChatWelcome type={type} name={name} />
            <div className='flex flex-col-reverse mt-auto'>
                {data?.pages?.map((group, index) => (
                    <Fragment key={index}>
                        {group.items.map((message: MessageWithMemberWithUser) => (
                            <ChatItem 
                                key={message.id}
                                id={message.id}
                                currentMember={member}
                                member={message.member}
                                content={message.content}
                                fileUrl={message.fileUrl}
                                deleted={message.deleted}
                                timestamp={formatMessageDate(message.createdAt)}
                                isUpdated={message.updatedAt !== message.createdAt}
                                messageApiUrl={messageApiUrl}
                                socketQuery={socketQuery} />
                        ))}
                    </Fragment>
                ) )}
            </div>
        </div>
    )
}

export default ChatMessages;