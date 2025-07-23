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
    member?: Member;
    chatId: string;
    messageApiUrl: string;
    socketQuery: Record<string, string>;
    paramKey: 'channelId' | 'conversationId';
    paramValue: string;
    type: 'channel' | 'botConversation' | 'conversation';
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
    const initialMessagesLoadedRef = useRef(false);

    const queryKey = type === 'botConversation' ? `bot-chat:${chatId}` : `chat:${chatId}`;
    const addKey = type === 'botConversation' ? `bot-chat:${chatId}:messages` : `chat:${chatId}:messages`;
    const updateKey = type === 'botConversation' ? `bot-chat:${chatId}:messages:update` : `chat:${chatId}:messages:update`;

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

    // Restore scroll position after loading more messages
    const restoreScrollPosition = () => {
        if (!chatContainerRef.current || !loadingMore) return;
        
        // Ensure scroll is instant for restoration
        chatContainerRef.current.style.scrollBehavior = 'auto';

        const newScrollHeight = chatContainerRef.current.scrollHeight;
        const heightDifference = newScrollHeight - heightBeforeLoadRef.current;
        
        if (heightDifference > 0) {
            chatContainerRef.current.scrollTop = scrollPositionRef.current + heightDifference;
        }
        
        setLoadingMore(false);
    };

    // Scroll to bottom using direct scrollTop manipulation and style.scrollBehavior
    const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
        if (!chatContainerRef.current) return;

        if (behavior === 'smooth') {
            chatContainerRef.current.style.scrollBehavior = 'smooth';
            // Use rAF to ensure style is applied before scroll operation
            requestAnimationFrame(() => {
                if (chatContainerRef.current) { // Re-check ref in async callback
                    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                }
            });
        } else { // 'auto' or any other value for instant scroll
            chatContainerRef.current.style.scrollBehavior = 'auto';
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    // Handle loading previous messages when scrolling to top
    const handleScroll = () => {
        const container = chatContainerRef.current;
        if (!container) return;
        
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 10;
        hasScrolledToBottomRef.current = isNearBottom;
        
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
            requestAnimationFrame(() => {
                restoreScrollPosition();
            });
        }
    }, [isFetchingNextPage, loadingMore]);
    
    // Auto-scroll based on message updates (initial and new)
    useEffect(() => {
        if (!data?.pages?.[0]?.items?.length) {
            return;
        }
    
        if (!initialMessagesLoadedRef.current) {
            scrollToBottom('auto'); 
            hasScrolledToBottomRef.current = true; 
            initialMessagesLoadedRef.current = true;
        } else {
            if (hasScrolledToBottomRef.current) {
                scrollToBottom('smooth'); 
                // Optimistically set to true, assuming smooth scroll will take them to the bottom.
                // This helps if another message arrives while a smooth scroll is in progress.
                hasScrolledToBottomRef.current = true; 
            }
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
            
            return () => {
                socket.emit('unsubscribe_from_channel', chatId);
            };
        }
    }, [socket, chatId]);

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
                        {group.items.map((message: any) => {
                            // Handle different message types
                            if (type === 'botConversation') {
                                // Bot messages don't have member data
                                return (
                                    <ChatItem 
                                        key={message.id}
                                        id={message.id}
                                        currentMember={member}
                                        content={message.content}
                                        fileUrl={message.fileUrl}
                                        deleted={message.deleted}
                                        timestamp={formatMessageDate(message.createdAt)}
                                        isUpdated={message.updatedAt !== message.createdAt}
                                        messageApiUrl={messageApiUrl}
                                        socketQuery={socketQuery}
                                        modelName={message.modelName}
                                        type={type}
                                        isBotMessage={true}
                                        botName={message.bot?.name}
                                        botImageUrl={message.bot?.imageUrl}
                                        fromBot={message.fromBot}
                                    />
                                );
                            } else {
                                // Regular messages with member data
                                return (
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
                                );
                            }
                        })}
                    </Fragment>
                ))}
            </div>
            <div ref={bottomRef} />
        </div>
    )
}

export default ChatMessages;