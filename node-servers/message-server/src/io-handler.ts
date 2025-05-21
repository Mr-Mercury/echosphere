import { Server as  NetServer } from 'http';
import { Server as IoServer } from 'socket.io';


// NOTE: This file is a 'lazy' implementation for creating a socket on demand - for saving money.  
// consider using this in deployment to manage whether bots are running or not.


export const config = {
    api: {
        bodyParser: false,
    },
};
//@ts-ignore
const ioHandler = (req, res) => {
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