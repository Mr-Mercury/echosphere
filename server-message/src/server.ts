import { ExpressAuth, getSession } from "@auth/express"
import express, { Request, Response, NextFunction } from "express";
import { createServer } from 'http';
import { Server as IoServer } from 'socket.io';


import { authenticatedUser } from "./message-auth.js";
    
import { db } from "./lib/messageDbConnection.js";

//TODO: Env variables for port to enable horizontal scaling 

//TODO: Notes on socket.io expansions - will require a different adapter - search for MySQL adapter or change the 
// postgres adapter later on OR use the Redis adapter (preferred)
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

io.on('connection', (socket) => {

})

server.listen(port, () => {
    console.log('Socket listening on port ' + port);
})