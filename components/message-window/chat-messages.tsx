'use client';

import ChatWelcome from "./chat-welcome";

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
    return (
        <div className='flex-1 flex flex-col py-4 overflow-y-auto'>
            <div className='flex-1'/>
            <ChatWelcome type={type} name={name} />
        </div>
    )
}

export default ChatMessages;