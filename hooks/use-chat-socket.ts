import { useSocket } from "@/components/providers/socket-provider";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Member, Message, User } from "@prisma/client";
import { Socket } from "socket.io-client";

type ChatSocketProps = {
    addKey: string;
    updateKey: string;
    queryKey: string;
    onError?: (error: any) => void;
}

type MessageWithMemberWithUser = Message & {
    member: Member & {
        user: User;
    }
}

export const useChatSocket = ({
    addKey, updateKey, queryKey, onError
}: ChatSocketProps) => {
    const {socket} = useSocket();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!socket) { return };

        socket.on(updateKey, (message: MessageWithMemberWithUser) => {
            try {
                queryClient.setQueryData([queryKey], (oldData: any) => {
                    
                    if (!oldData || !oldData.pages || oldData.pages.length === 0) {
                        return oldData;
                    }
                    
                    const newData = oldData.pages.map((page: any) => {
                        return {
                            ...page,
                            items: page.items.map((item: MessageWithMemberWithUser) => {
                                if (item.id === message.id) {
                                    return message;
                                }
                                return item;
                            })
                        }
                    });
                    
                    return {
                        ...oldData,
                        pages: newData,
                    }      
                });
            } catch (error) {
                if (onError) {
                    onError(error);
                } else {
                    console.error("Error in socket updateKey handler:", error);
                }
            }
        });

        socket.on(addKey, (message: MessageWithMemberWithUser) => {
            try {
                queryClient.setQueryData([queryKey], (oldData: any) => {
                    if (!oldData || !oldData.pages || oldData.pages.length === 0) {
                        return {
                            pages: [{
                                items: [message]
                            }]
                        }
                    }

                    const newData = [...oldData.pages];

                    if (!newData[0]) {
                        return {
                            ...oldData,
                            pages: [{
                                items: [message]
                            }, ...newData.slice(1)]
                        };
                    }

                    const existingItems = newData[0].items || [];

                    newData[0] = {
                        ...newData[0],
                        items: [message, ...existingItems],
                    }

                    return {
                        ...oldData,
                        pages: newData,
                    }
                });
            } catch (error) {
                if (onError) {
                    onError(error);
                } else {
                    console.error("Error in socket addKey handler:", error);
                }
            }
        });
        
        return () => {
            socket.off(updateKey);
            socket.off(addKey);
        }
    }, [queryClient, addKey, updateKey, queryKey, socket, onError]);
}