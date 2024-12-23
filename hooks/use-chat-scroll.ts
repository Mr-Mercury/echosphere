import { useState, useEffect } from "react";

type ChatScrollProps = {
    chatRef: React.RefObject<HTMLDivElement>;
    bottomRef: React.RefObject<HTMLDivElement>;
    shouldLoadMore: boolean;
    loadMore: () => void;
    count: number;
    scrollThreshold?: number;
    scrollBehavior?: ScrollBehavior;
    scrollDelay?: number;
}
// TODO: Implement this with tanstack query's onSettled or onSuccess !  Check and see if it's 
// more performant or not. 

export const useChatScroll = ({
    chatRef,
    bottomRef,
    shouldLoadMore,
    loadMore,
    count,
    scrollThreshold = 100,
    scrollBehavior = 'smooth' as ScrollBehavior,
    scrollDelay = 100
}: ChatScrollProps) => {
    const [hasInitialized, setHasInitialized] = useState(false);

    useEffect(() => {
        const topDiv = chatRef?.current;

        const handleScroll = () => {
            const scrollTop = topDiv?.scrollTop;

            if (scrollTop === 0 && shouldLoadMore) {
                loadMore();
            }
        };
        topDiv?.addEventListener('scroll', handleScroll);

        return () => {
            topDiv?.removeEventListener('scroll', handleScroll);
        }
    }, [shouldLoadMore, loadMore, chatRef]);

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
// First implementation: 
    // useEffect(() => {
    //     const bottomElement = bottomRef?.current;
    //     const chatElement = chatRef?.current;

    //     const shouldAutoScroll = () => {
    //         if (!chatElement) return false;
            
    //         if (status === 'pending' || isFetchingNextPage) return false;
            
    //         if (status === 'success' && data?.pages?.[0]?.items?.length) return true;

    //         const distanceFromBottom = 
    //             chatElement.scrollHeight - chatElement.scrollTop - chatElement.clientHeight;
    //         return distanceFromBottom <= 100;
    //     };

    //     if (bottomElement && shouldAutoScroll()) {
    //         setTimeout(() => {
    //             bottomElement.scrollIntoView({
    //                 behavior: 'smooth'
    //             });
    //         }, 100);
    //     }
    // }, [status, data, isPending, isFetchingNextPage]);