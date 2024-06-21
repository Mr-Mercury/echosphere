import { Server as IoServer } from 'socket.io';
export const config = {
    api: {
        bodyParser: false,
    },
};
const ioHandler = (req, res) => {
    if (!res.socket.server.io) {
        const path = '/api/socket/io';
        const httpServer = res.socket.server;
        const io = new IoServer(httpServer, {
            path: path,
            addTrailingSlash: false,
        });
    }
};
export default ioHandler;
//# sourceMappingURL=io-handler.js.map