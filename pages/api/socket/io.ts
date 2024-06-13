import { Server as  NetServer } from 'http';
import { NextApiRequest } from 'next';
import { Server as IoServer } from 'socket.io';
import { NextApiResponseIoServer } from '@/lib/entities/servers';

export const config = {
    api: {
        bodyParser: false,
    },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseIoServer) => {
    if (!res.socket.server.io) {
        const path = '/api/socket/io';
        const httpServer: NetServer = res.socket.server as any;
        const io = new IoServer(httpServer, {
            path: path,
            addTrailingSlash: false,
        })
    }
}

export default ioHandler;