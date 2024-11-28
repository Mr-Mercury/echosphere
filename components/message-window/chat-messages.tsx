'use client';

import ChatItem from "./chat-item";
import { useChatQuery } from "@/hooks/use-chat-query";
import ChatWelcome from "./chat-welcome";
import { Loader2, ServerCrash } from "lucide-react";
import { Member, Message, User } from "@prisma/client";
import { Fragment, useRef, ElementRef, useEffect } from "react";
import { format } from 'date-fns';
import { useChatSocket } from "@/hooks/use-chat-socket";
import { useChatScroll } from "@/hooks/use-chat-scroll";

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

    const chatRef = useRef<ElementRef<'div'>>(null);
    const bottomRef = useRef<ElementRef<'div'>>(null);


    const {
        data, 
        fetchNextPage, 
        hasNextPage, 
        isFetchingNextPage, 
        status,
        isPending
    } = useChatQuery({
        queryKey,
        messageApiUrl,
        paramKey,
        paramValue,
    });

    useChatSocket({ 
        queryKey, 
        addKey, 
        updateKey,
        onError: (error) => {
            console.error("Socket error:", error);
        }
    });

    useChatScroll({
        chatRef,
        bottomRef,
        shouldLoadMore: hasNextPage,
        loadMore: fetchNextPage,
        count: data?.pages?.[0]?.items?.length || 0,
    });

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
        <div ref={chatRef}className='flex-1 flex flex-col py-4 overflow-y-auto'>
            {!hasNextPage && <div className='flex-1' />}
            {!hasNextPage && <ChatWelcome type={type} name={name} />}
            {hasNextPage && (
                <div className='flex justify-center'>
                    {isFetchingNextPage ? (
                        <Loader2 className='h-6 w-6 animate-spin text-zinc-500 my-4'/>
                    ) : (
                        <button 
                            onClick={() => fetchNextPage()}
                            className='text-zinc-400 hover:text-zinc-300 text-xs transition my-4'
                        >
                            Load Previous Messages
                        </button>
                    )}
                </div>
            )}
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
            <div ref={bottomRef} />
        </div>
    )
}

export default ChatMessages;