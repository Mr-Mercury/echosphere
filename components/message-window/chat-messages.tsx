'use client';

import ChatItem from "./chat-item";
import { useChatQuery } from "@/hooks/use-chat-query";
import ChatWelcome from "./chat-welcome";
import { Loader2, ServerCrash } from "lucide-react";
import { Member, Message, User } from "@prisma/client";
import { Fragment, useRef, ElementRef, useEffect, useState } from "react";
import { format } from 'date-fns';
import { useChatSocket } from "@/hooks/use-chat-socket";
import { useSocket } from "@/components/providers/socket-provider";

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
        user: User & {
            botConfig: {
                model: string;
            } | null;
        }
    };
    modelName?: string;
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
    const { socket } = useSocket();
    const [loadingMore, setLoadingMore] = useState(false);
    const chatContainerRef = useRef<ElementRef<'div'>>(null);
    const bottomRef = useRef<ElementRef<'div'>>(null);
    const heightBeforeLoadRef = useRef(0);
    const scrollPositionRef = useRef(0);
    const hasScrolledToBottomRef = useRef(true);

    const queryKey = `chat:${chatId}`;
    const addKey = `chat:${chatId}:messages`;
    const updateKey = `chat:${chatId}:messages:update`;

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

    // Save scroll position before loading more messages
    const saveScrollPosition = () => {
        if (!chatContainerRef.current) return;
        heightBeforeLoadRef.current = chatContainerRef.current.scrollHeight;
        scrollPositionRef.current = chatContainerRef.current.scrollTop;
        setLoadingMore(true);
    };

    // Restore scroll position after loading more messages with absolute precision
    const restoreScrollPosition = () => {
        if (!chatContainerRef.current || !loadingMore) return;
        
        const newScrollHeight = chatContainerRef.current.scrollHeight;
        const heightDifference = newScrollHeight - heightBeforeLoadRef.current;
        
        if (heightDifference > 0) {
            // Set scroll position immediately with no animation to prevent any visible jump
            chatContainerRef.current.scrollTop = scrollPositionRef.current + heightDifference;
        }
        
        setLoadingMore(false);
    };

    // Scroll to bottom for new messages
    const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
        bottomRef.current?.scrollIntoView({ behavior });
    };

    // Handle loading previous messages when scrolling to top
    const handleScroll = () => {
        const container = chatContainerRef.current;
        if (!container) return;
        
        // Check if near bottom
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
        hasScrolledToBottomRef.current = isNearBottom;
        
        // Check if at top and should load more
        const isAtTop = container.scrollTop < 60;
        if (isAtTop && hasNextPage && !isFetchingNextPage && !loadingMore) {
            saveScrollPosition();
            fetchNextPage();
        }
    };
    
    // Set up scroll event listener
    useEffect(() => {
        const container = chatContainerRef.current;
        if (!container) return;
        
        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [hasNextPage, isFetchingNextPage, loadingMore]);
    
    // Restore scroll position after loading completes
    useEffect(() => {
        if (!isFetchingNextPage && loadingMore) {
            // Use requestAnimationFrame to ensure the DOM has been updated before adjusting scroll
            requestAnimationFrame(() => {
                restoreScrollPosition();
            });
        }
    }, [isFetchingNextPage, loadingMore]);
    
    // Auto-scroll to bottom for new messages if already at bottom
    useEffect(() => {
        if (hasScrolledToBottomRef.current) {
            scrollToBottom();
        }
    }, [data?.pages?.[0]?.items]);
    
    // Handle socket events
    useChatSocket({ 
        queryKey, 
        addKey, 
        updateKey,
        onError: (error) => {
            console.error("Socket error:", error);
        }
    });

    // Subscribe to channel
    useEffect(() => {
        if (socket && chatId) {
            socket.emit('subscribe_to_channel', chatId);
            
            // Fix return type by explicitly returning void
            return () => {
                socket.emit('unsubscribe_from_channel', chatId);
            };
        }
    }, [socket, chatId]);
    
    // Initial scroll to bottom when first loading
    useEffect(() => {
        if (status === 'success' && !hasScrolledToBottomRef.current) {
            scrollToBottom();
            hasScrolledToBottomRef.current = true;
        }
    }, [status]);

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
        <div 
            ref={chatContainerRef} 
            className='flex-1 flex flex-col py-4 overflow-y-auto h-[calc(100vh-130px)]'
        >
            {hasNextPage && (
                <div className='flex justify-center py-2'>
                    {isFetchingNextPage ? (
                        <div className="flex flex-col items-center">
                            <Loader2 className='h-6 w-6 animate-spin text-zinc-500 my-2'/>
                            <span className="text-xs text-zinc-400">Loading previous messages...</span>
                        </div>
                    ) : (
                        <button 
                            onClick={() => {
                                saveScrollPosition();
                                fetchNextPage();
                            }}
                            className='text-zinc-400 hover:text-zinc-300 text-xs transition my-2 px-4 py-2 bg-zinc-700/50 rounded-md'
                        >
                            Load Previous Messages
                        </button>
                    )}
                </div>
            )}
            
            {!hasNextPage && <div className='flex-1' />}
            {!hasNextPage && <ChatWelcome type={type} name={name} />}
            
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
                                socketQuery={socketQuery}
                                modelName={message.modelName}
                                type={type} 
                            />
                        ))}
                    </Fragment>
                ))}
            </div>
            <div ref={bottomRef} />
        </div>
    )
}

export default ChatMessages;