import express from "express";
import { createServer } from 'http';
import { Server as IoServer } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import { scheduleSessionRecheck, socketAuthMiddleware } from "./lib/message-auth.js";
//TODO: Env variables for port to enable horizontal scaling 
//TODO: Notes on socket.io expansions - will require a different adapter - search for MySQL adapter or change the 
// postgres adapter later on OR use the Redis adapter (preferred)
dotenv.config();
const port = 4000;
const app = express();
const server = createServer(app);
const io = new IoServer(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
});
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
// Auth logic here 
let activeSessions = {};
io.use(socketAuthMiddleware);
io.on('connection', (socket) => {
    //@ts-ignore
    console.log('a user connected' + socket.user);
    scheduleSessionRecheck(socket);
    socket.on('disconnect', () => {
        console.log('User disconnected');
        //@ts-ignore
        clearInterval(socket.sessionInterval);
    });
});
server.listen(port, () => {
    console.log('Socket listening on port ' + port);
});
//# sourceMappingURL=server.js.map