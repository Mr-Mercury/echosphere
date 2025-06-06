    import { ExpressAuth, getSession } from "@auth/express";
    import express, { Request, Response, NextFunction } from "express";
    import { createServer } from 'http';
    import activeSessions from "./util/sessionStore.js";
    import { Server as IoServer, Socket } from 'socket.io';
    import { messageGetUserById } from "./lib/messages/messageGetUserById.js";
    import dotenv from 'dotenv';
    import cors from 'cors';
    import {messagePostHandler, messageEditHandler} from "./lib/messages/message-handler.js";
    import { BotServiceManager } from "./lib/bot-management/botService.js";

    import type { AdapterUser, AdapterSession } from '@auth/core/adapters';
    import type { Session } from "@auth/express";
    import type { JWT } from "next-auth/jwt";
    import type { ChatSocket, User, Token, SessionCallback } from "./lib/entities/server-types.js";




    import { scheduleSessionRecheck, socketAuthMiddleware } from "./lib/messages/message-auth.js";
        
    import { db } from "./lib/messages/messageDbConnection.js";

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

    const botService = new BotServiceManager(io);

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

    // BOT POSTING ROUTE
    app.post('/message', async (req, res) => {
        try {
            const { content, fileUrl } = req.body;
            const { channelId, serverId, conversationId } = req.query;
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
                serverId, 
                channelId, 
                conversationId: conversationId?.toString() || null, 
                fileUrl, 
                content,
                type: conversationId ? 'dm' : 'channel' as const
            }
            //@ts-ignore
            const result = await messagePostHandler(params);
            //@ts-ignore

            if (result.status === 200) {
                const channelKey = `chat:${channelId}:messages`
            }
            //@ts-ignore

            res.status(result.status).send(result.message);
        } catch (error) {
            console.log('MESSAGE SERVER POST ERROR', error);
            res.status(500).json({ error: 'Failed to post message' });
        }
    })

    app.post('/bots/start', async (req, res) => {
        try {
            const { botConfig } = req.body;

            if (!botConfig || !botConfig.id) {
                return res.status(400).json({ error: 'Invalid bot configuration' });
            }

            await botService.startBot(botConfig);
            res.status(200).json({ message: 'Bot started successfully' });
        } catch (error) {
            console.log('MESSAGE SERVER BOT START ERROR: ', error);
            res.status(500).json({ error: 'Failed to start bot' });
        }
    })  

    app.post('/bots/stop', async (req, res) => {
        try {
            const { botId } = req.body;

            if (!botId) {
                return res.status(400).json({ error: 'Invalid bot ID' });
            }

            await botService.toggleBot(botId, false);
            res.status(200).json({ message: 'Bot stopped successfully' });
        } catch (error) {
            console.log('MESSAGE SERVER BOT STOP ERROR: ', error);
            res.status(500).json({ error: 'Failed to stop bot' });
        }
    })

    app.post('/bots/toggle', async (req, res) => {
        try {
            const { botId, isActive } = req.body;
            console.log('Received bot toggle request:', { botId, isActive });

            if (!botId) {
                console.log('Invalid bot ID received');
                return res.status(400).json({ error: 'Invalid bot ID' });
            }

            console.log('Attempting to toggle bot with botService');
            await botService.toggleBot(botId, isActive);
            console.log('Bot toggle successful');
            
            res.status(200).json({ message: 'Bot toggled successfully' });
        } catch (error) {
            console.error('MESSAGE SERVER BOT TOGGLE ERROR: ', error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({ error: 'Failed to toggle bot', details: message });
        }
    })

    app.post('/bots/stop-server', async (req, res) => {
        try {
            const { serverId } = req.body;
            console.log('Received server stop all bots request:', { serverId });

            if (!serverId) {
                console.log('Invalid server ID received');
                return res.status(400).json({ error: 'Invalid server ID' });
            }

            console.log('Attempting to stop all bots for server with botService');
            const result = await botService.stopAllServerBots(serverId);
            console.log('Server bots stop successful');
            
            res.status(200).json({ 
                message: 'All server bots stopped successfully', 
                count: result.count,
                results: result.results
            });
        } catch (error) {
            console.error('MESSAGE SERVER STOP ALL SERVER BOTS ERROR: ', error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({ error: 'Failed to stop all server bots', details: message });
        }
    })

    app.post('/bots/start-server', async (req, res) => {
        try {
            const { serverId } = req.body;
            console.log('Received server start all bots request:', { serverId });

            if (!serverId) {
                console.log('Invalid server ID received');
                return res.status(400).json({ error: 'Invalid server ID' });
            }

            console.log('Attempting to start all bots for server with botService');
            const result = await botService.startAllServerBots(serverId);
            console.log('Server bots start successful');
            
            res.status(200).json({ 
                message: 'All server bots started successfully', 
                count: result.count,
                results: result.results
            });
        } catch (error) {
            console.error('MESSAGE SERVER START ALL SERVER BOTS ERROR: ', error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({ error: 'Failed to start all server bots', details: message });
        }
    })

    // Socket logic starts here
    
    io.use(socketAuthMiddleware);

    // Join socket polling on connection based on user's server membership
    // TODO: Create file in lib to handle this
    io.on('connection', (socket: ChatSocket) => {
        const session = socket.data.session;
        const username = session?.user?.username;
        const userId = session?.user?.id ?? 'Guest';
        console.log('User ' + (username || 'Unknown') + ' connected');

        // Join the channel room based on socketQuery
        socket.on('subscribe_to_channel', (channelId: string) => {
            console.log(`User ${username} subscribing to channel: ${channelId}`);
            socket.join(channelId);
            console.log(`Room ${channelId} members:`, io.sockets.adapter.rooms.get(channelId)?.size);
        });

        scheduleSessionRecheck(socket);

        socket.on('message', async (data) => {
            console.log('User ' + (session?.user?.username || 'Unknown') + ' messaged');
            try {
                const { query, values, type } = data;
                const { serverId, channelId, conversationId } = query;
                //TODO: add fileUrl for socket to frontend
                const fileUrl = values.fileUrl;
                const content = values.content;
                let channelKey;
                
                if (type !== 'dm' && type !== 'channel') return { status: 400, error: 'Invalid message type!'};

                if (type === 'channel') {
                    if (!serverId) return { status: 400, error: 'Server Id missing!'};
                    if (!channelId) return { status: 400, error: 'Channel Id missing!'};
                    channelKey = `chat:${channelId}:messages`;
                    // Join the channel room when sending a message
                    socket.join(channelId);
                }

                if (type === 'dm') {
                    if (!conversationId) return { status: 400, error: 'Conversation Id missing!'};
                    channelKey = `chat:${conversationId}:messages`;
                }

                const params = { 
                    userId, serverId, channelId, conversationId, fileUrl, content, type 
                };
                // Send required info to message Handler followed by emission & key
                const result = await messagePostHandler(params);
                if (!channelKey) return { status: 400, error: 'Channel key is undefined!'};
                io.to(channelId).emit(channelKey, result.message); 
            } catch (error) {
                console.log('SOCKET MESSAGE POST ERROR: ', error);
                io.emit('error', { status: 500, error: 'SOCKET MESSAGE POST ERROR'});
            }   
        })

        socket.on('alter', async (data) => {
            try {
                console.log('User ' + session?.user?.username || 'Unknown' + ' edited a message');
                const {query, content, messageId, method, type} = data;
                const { serverId, channelId, conversationId } = query;
                let updateKey;
            
                if (!content) return { status: 400, error: 'No content in replacement!'};

                const params = { 
                    userId, 
                    messageId, 
                    serverId, 
                    channelId, 
                    conversationId,
                    content, 
                    method,
                    type
                }

                if (type === 'channel') {
                    if (!serverId) return { status: 400, error: 'Server Id missing!'};
                    if (!channelId) return { status: 400, error: 'Channel Id missing!'};
                    updateKey = `chat:${channelId}:messages:update`;
                }

                if (type === 'dm') {
                    if (!conversationId) return { status: 400, error: 'Conversation Id missing!'};
                    updateKey = `chat:${conversationId}:messages:update`;
                    console.log('updateKey is: ' + updateKey);
                }

                if (!updateKey) return { status: 400, error: 'Update key is undefined!'};

                const response = await messageEditHandler(params);
                io.emit(updateKey, response?.message);

                return response;
            } catch (error) {
                console.log('SOCKET ALTER ERROR: ', error);
                io.emit('error', { status: 500, error: 'SOCKET ALTER ERROR'});
            }
        })

        socket.on('newBot', async (botConfig) => {
            try {
                await botService.startBot(botConfig);
                console.log('Bot started: ' + botConfig.botName);
            } catch (error) {
                console.log('SOCKET NEW BOT ERROR: ', error);
                io.emit('error', { status: 500, error: 'SOCKET NEW BOT ERROR'});
            }
        })
        
        socket.on('disconnect', () => {
            console.log('User ' + session?.user?.username || 'Unknown' + ' disconnected');
            activeSessions.delete(socket.id);
            clearInterval(socket.data.sessionInterval);
        });
    });

    server.listen(port, () => {
        console.log('Socket listening on port ' + port);
        try {
            botService.Initialize();
            console.log('Bot Service Manager Initialized');
        } catch (error) {
            console.error('Failed to initialize bot service manager (message server): ', error);
        }
    })

    process.on('SIGTERM', () => {
        console.log('SIGTERM received, shutting down gracefully');
        
        // Set a timeout to force exit if graceful shutdown takes too long
        const forceExitTimeout = setTimeout(() => {
            console.log('Forcing exit after timeout');
            process.exit(1);
        }, 5000);
        
        // Clear the timeout if we exit normally
        forceExitTimeout.unref();
        
        try {
            // Stop all bots first
            botService.stopAll();
            
            // Close the server with a timeout
            server.close(() => {
                console.log('Server closed successfully');
                process.exit(0);
            });
        } catch (error) {
            console.error('Error during shutdown:', error);
            process.exit(1);
        }
    });

    // Handle SIGINT (Ctrl+C) the same way
    process.on('SIGINT', () => {
        console.log('SIGINT received, shutting down gracefully');
        
        // Set a timeout to force exit if graceful shutdown takes too long
        const forceExitTimeout = setTimeout(() => {
            console.log('Forcing exit after timeout');
            process.exit(1);
        }, 5000);
        
        // Clear the timeout if we exit normally
        forceExitTimeout.unref();
        
        try {
            // Stop all bots first
            botService.stopAll();
            
            // Close the server with a timeout
            server.close(() => {
                console.log('Server closed successfully');
                process.exit(0);
            });
        } catch (error) {
            console.error('Error during shutdown:', error);
            process.exit(1);
        }
    });