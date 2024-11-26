    import { ExpressAuth, getSession } from "@auth/express";
    import express, { Request, Response, NextFunction } from "express";
    import { createServer } from 'http';
    import activeSessions from "./util/sessionStore.js";
    import { Server as IoServer, Socket } from 'socket.io';
    import { messageGetUserById } from "./lib/messageGetUserById.js";
    import dotenv from 'dotenv';
    import cors from 'cors';
    import {messagePostHandler, messageEditHandler} from "./lib/message-handler.js";

    import type { AdapterUser, AdapterSession } from '@auth/core/adapters';
    import type { Session } from "@auth/express";
    import type { JWT } from "next-auth/jwt";
    import type { ChatSocket, User, Token, SessionCallback } from "./lib/entities/server-types.js";




    import { scheduleSessionRecheck, socketAuthMiddleware } from "./lib/message-auth.js";
        
    import { db } from "./lib/messageDbConnection.js";

    //TYPES - TODO: remove index signatures in final version

    // This is necessary because the AuthJS guys hate credentials and provide no functionality for them
    declare module '@auth/core/adapters' {
        interface AdapterUser {
            username: string;
            human: boolean;
        }
    }


    interface AuthConfigType {
        secret: string | undefined;
        providers: any[];
        callbacks: {
            jwt: (params: {
                token: JWT;
                user?: User;
                trigger?: "signIn" | "signUp" | "update";
                session?: any;
                isNewUser?: boolean;
            }) => Promise<Token>;
            session: (params: {
                session: AdapterSession & { user: AdapterUser };
                user: AdapterUser;
                token: Token;
                newSession?: any;
                trigger?: "update";
            }) => Promise<Session>;
        };
    }
    
    

    //TODO: Env variables for port to enable horizontal scaling 

    //TODO: Notes on socket.io expansions - will require a different adapter - search for MySQL adapter or change the 
    // postgres adapter later on OR use the Redis adapter (preferred)
    dotenv.config();

    const AuthConfig: Parameters<typeof getSession>[1] = {
        secret: process.env.AUTH_SECRET,
        providers: [],
        callbacks: {
            async jwt(params) {
                let token = params.token;
                const { user } = params;
    
                if (user) {
                    token.sub = user.id;
                    token.username = (user as any).username;
                    token.human = (user as any).human;
                }
    
                if (!token.sub) return token;
            
                const existingUser = await messageGetUserById(token.sub);
                if (!existingUser) return token;
    
                token.human = existingUser.human;
                token.username = existingUser.username;
                return token;
            },
            async session(params) {
                const { session, token } = params;
    
                if (token.sub && session.user) {
                    session.user.id = token.sub;
                }
    
                if (session.user) {
                    (session.user as any).username = (token as any).username;
                    (session.user as any).human = (token as any).human;
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

    // Auth logic starts here 

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
            const { content, fileUrl } = req.body;
            const { channelId, serverId } = req.query;
            //TODO: Start here to address message posting issues (this is the route for bots)
            const session = await getSession(req, AuthConfig);

            if (!session) return res.status(401).json({ error: 'Session Missing!' });
            if (!serverId) return res.status(400).json({ error: 'Missing server ID! '});
            if (!channelId) return res.status(400).json({ error: 'Missing channel ID!' });
            if (!session?.user?.id) return res.status(400).json({ error: 'Missing User ID!' });
            if (typeof serverId !== 'string' || typeof channelId !== 'string') {
                return res.status(400).json({ error: 'Invalid server or channel ID format' });
            }

            const params = { 
                userId: session.user.id,
                serverId, channelId, fileUrl, content
            }

            const result = await messagePostHandler(params);

            if (result.status === 200) {
                const channelKey = `chat:${channelId}:messages`
            }

            res.status(result.status).send(result.message);
        } catch (error) {
            console.log('MESSAGE SERVER POST ERROR')
        }
    })

    // Socket logic starts here
    
    io.use(socketAuthMiddleware);

    // Join socket polling on connection based on user's server membership
    // TODO: Create file in lib to handle this
    io.on('connection', (socket: ChatSocket) => {
        const session = socket.data.session;
        const username = session?.user?.username;
        // TODO: Null check here when adding guests
        const userId = session?.user?.id ?? 'Guest';
        console.log('User ' + (username || 'Unknown') + ' connected');

        scheduleSessionRecheck(socket);

        socket.on('message', async (data) => {
            console.log('User ' + (session?.user?.username || 'Unknown') + ' messaged');
            try{
                const { query, values } = data;
                const { serverId, channelId } = query;
                //TODO: add fileUrl for socket to frontend
                const fileUrl = values.fileUrl;
                const content = values.content;
                
                if (!serverId) return { status: 400, error: 'Server Id missing!'};
                if (!channelId) return { status: 400, error: 'Channel Id missing!'};

                const params = { 
                    userId, serverId, channelId, fileUrl, content 
                }  
                // Send requred info to message Handler followed by emission & key
                const result = await messagePostHandler(params); 

                const channelKey = `chat:${channelId}:messages`;
                io.emit(channelKey, result);
                // Emit response from message handler
            } catch (error) {
                console.log('SOCKET MESSAGE POST ERROR: ', error);
                io.emit('error', { status: 500, error: 'SOCKET MESSAGE POST ERROR'});
            }   
        })

        socket.on('alter', async (data) => {
            console.log('User ' + session?.user?.username || 'Unknown' + ' edited a message');
            const {query, content, messageId, method} = data;
            const { serverId, channelId } = query;
            
            if (!serverId) return { status: 400, error: 'Server Id missing!'};
            if (!channelId) return { status: 400, error: 'Channel Id missing!'};
            if (!content) return { status: 400, error: 'No content in replacement!'};

            const params = { 
                userId, 
                messageId, 
                serverId, 
                channelId, 
                content, 
                method
            }
            console.log(params);
            const response = await messageEditHandler(params);
            const updateKey = `chat:${channelId}:messages:update`;
            io.emit(updateKey, response?.message);

            return response;

        })
        
        socket.on('disconnect', () => {
            console.log('User ' + session?.user?.username || 'Unknown' + ' disconnected');
            activeSessions.delete(socket.id);
            clearInterval(socket.data.sessionInterval);
        });
    });

    server.listen(port, () => {
        console.log('Socket listening on port ' + port);
    })