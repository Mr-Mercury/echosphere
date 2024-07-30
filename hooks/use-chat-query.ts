import qs from "query-string";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useSocket } from "@/components/providers/socket-provider";

interface ChatQueryProps {
    queryKey: string;
    paramKey: 'channelId' | 'conversationId';
    paramValue: string;
}

export const useChatQuery = ({queryKey, paramKey, paramValue}: ChatQueryProps) => {
    const { isConnected } = useSocket();
    const apiUrl = process.env.MESSAGE_SERVER_URL;

    const fetchMessages = async ({ pageParam = undefined}) => {
        const apiUrl = process.env.MESSAGE_SERVER_URL!;
        
        const url = qs.stringifyUrl({
            url: apiUrl,
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
        status
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
        status
    }
}