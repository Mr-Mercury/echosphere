import { Server, Member, User } from "@prisma/client"
import { Server as NetServer, Socket } from 'net';
import { NextApiResponse } from "next";
import { Server as SocketIoServer } from 'socket.io'; 

export type ServerWithMembersAndProfiles = Server & {
    members: (Member & { user: User })[];
};

export type NextApiResponseIoServer = NextApiResponse & {
    socket: Socket & {
        server: NetServer & {
            io: SocketIoServer
        }
    }
}