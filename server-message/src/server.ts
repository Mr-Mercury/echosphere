    import { ExpressAuth, getSession } from "@auth/express"
    import express, { Request, Response, NextFunction } from "express";
    import { createServer } from 'http';
    import activeSessions from "./util/sessionStore.js";
    import { Server as IoServer } from 'socket.io';
    import { messageGetUserById } from "./lib/messageGetUserById.js";
    import dotenv from 'dotenv';
    import cors from 'cors';


    import { scheduleSessionRecheck, socketAuthMiddleware } from "./lib/message-auth.js";
        
    import { db } from "./lib/messageDbConnection.js";

    //TODO: Env variables for port to enable horizontal scaling 

    //TODO: Notes on socket.io expansions - will require a different adapter - search for MySQL adapter or change the 
    // postgres adapter later on OR use the Redis adapter (preferred)
    dotenv.config();

    const AuthConfig = {
        secret: process.env.AUTH_SECRET,
        providers: [
        // Add the same providers if necessary
        // TODO: Test with oAuth
        ],
        callbacks: {//@ts-ignore
        async jwt({ token, user }) {
            if (user) {
            token.sub = user.id;
            token.username = user.username;
            token.human = user.human;
            }
    
            if (!token.sub) return token;
        
            const existingUser = await messageGetUserById(token.sub); // Ensure this utility is available
            if (!existingUser) return token;
    
            token.human = existingUser.human; 
            token.username = existingUser.username;
            return token;
        },//@ts-ignore
        async session({ session, token }) {
            if (token.sub && session.user) {
            session.user.id = token.sub;
            }
    
            if (token.username && session.user) {
            session.user.username = token.username;
            session.user.human = token.human;
            }
    
            return session;
        },
        },
    };
    

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
    }))

    // Auth logic here 

    app.post('/authenticate', async (req, res) => {
        try {
            const session = await getSession(req, AuthConfig);

            if (session && session.user) {
                res.json({ session });
            } else {
                throw new Error('APP AUTHENTICATE SESSION ERROR')
            }
        } catch (error) {
            console.log('MESSAGE SERVER AUTHENTICATION ERROR: ' + error);
            res.status(401).json({ error: 'Authentication failed'});
        }
    });

    app.post('/message', async (req, res) => {
        try {
            const { message, socketId } = req.body;
            const session = activeSessions.get(socketId);
            
            

        } catch (error) {
            console.log('MESSAGE SERVER POST ERROR')
        }
    })

    io.use(socketAuthMiddleware);


    io.on('connection', (socket) => {
        //@ts-ignore
        console.log('User ' + (socket.user?.username || 'Unknown') + ' connected');

        scheduleSessionRecheck(socket);

        socket.on('message', () => {//@ts-ignore
            console.log('User ' + socket.user?.username || 'Unknown' + ' messaged');
        })

        socket.on('disconnect', () => {//@ts-ignore
            console.log('User ' + socket.user?.username || 'Unknown' + ' disconnected');
            const session = activeSessions.get(socket.id);
            activeSessions.delete(socket.id);
            //@ts-ignore
            clearInterval(socket.sessionInterval);
        });
    });

    server.listen(port, () => {
        console.log('Socket listening on port ' + port);
    })