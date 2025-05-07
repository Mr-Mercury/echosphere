import { useState, useEffect } from "react";

type ChatScrollProps = {
    chatRef: React.RefObject<HTMLDivElement>;
    bottomRef: React.RefObject<HTMLDivElement>;
    shouldLoadMore?: boolean;
    loadMore?: () => void;
    count: number;
    scrollThreshold?: number;
    scrollBehavior?: ScrollBehavior;
    scrollDelay?: number;
}

export const useChatScroll = ({
    chatRef,
    bottomRef,
    count,
    scrollThreshold = 50,
    scrollBehavior = 'smooth' as ScrollBehavior,
    scrollDelay = 100
}: ChatScrollProps) => {
    const [hasInitialized, setHasInitialized] = useState(false);

    // Auto-scroll to bottom when new messages come in
    useEffect(() => {
        const bottomDiv = bottomRef?.current;
        const topDiv = chatRef?.current;

        const shouldAutoScroll = () => {
            if (!hasInitialized && bottomDiv) {
                setHasInitialized(true);
                return true;
            }

            if (!topDiv) return false;

            const distanceFromBottom = topDiv.scrollHeight - topDiv.scrollTop - topDiv.clientHeight;
            return distanceFromBottom <= scrollThreshold;
        }            
        
        if (shouldAutoScroll()) {
            setTimeout(() => {
                bottomDiv?.scrollIntoView({ behavior: scrollBehavior });
            }, scrollDelay);
        }
    }, [bottomRef, chatRef, count, hasInitialized, scrollThreshold, scrollBehavior, scrollDelay]);
}