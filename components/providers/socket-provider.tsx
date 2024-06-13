'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io as ClientIo } from 'socket.io-client';
// Workaround to access context via socket because context rerenders any dependent
// components - forces rerenders based on incoming and outgoing data b/c context is updated
type SocketContextType = {
    socket: any | null;
    isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
})

export const useSocket = () => {
    return useContext(SocketContext);
}

export const SocketProvider = ({children}: { children: React.ReactNode}) => {
    const [socket, setSocket ] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        //Sets up the socket instance - env variable so it remains flexible in dev vs deployed
        const socketInstance = new (ClientIo as any)(process.env.NEXT_PUBLIC_SITE_URL!, {
            path: '/api/socket/io',
            addTrailingSlash: false,
        })

        socketInstance.on('connect', () => {
            setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
            setIsConnected(false);
        });

        setSocket(socketInstance);

        //standard cleanup function, could also be named but online docs say this is more concise
        return () => {
            socketInstance.disconnect();
        }
    }, []);

    return (
        <SocketContext.Provider value={{socket, isConnected}}>
            {children}
        </SocketContext.Provider>
    )
}