import qs from "query-string";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useSocket } from "@/components/providers/socket-provider";

interface ChatQueryProps {
    messageApiUrl: string;
    queryKey: string;
    paramKey: 'channelId' | 'conversationId';
    paramValue: string;
}

export const useChatQuery = ({queryKey, paramKey, messageApiUrl, paramValue}: ChatQueryProps) => {
    const { isConnected } = useSocket();

    const fetchMessages = async ({ pageParam = undefined}) => {
        
        const url = qs.stringifyUrl({
            url: messageApiUrl,
            query: {
                cursor: pageParam, 
                [paramKey]: paramValue}
        }, {skipNull: true});

        const res = await fetch(url);
        return res.json(); 
    };

    const { 
        data, 
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        isPending
    } = useInfiniteQuery({
        queryKey: [queryKey],
        queryFn: fetchMessages,
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
        refetchInterval: isConnected? false: 1000,
        initialPageParam: undefined,
    });

    return {
        data, 
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        isPending
    }
}