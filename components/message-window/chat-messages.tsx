'use client';

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
        <div className='flex-1'>
            LOOK MA MESSAGES
        </div>
    )
}

export default ChatMessages;