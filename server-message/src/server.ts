    import { ExpressAuth, getSession } from "@auth/express";
    import express, { Request, Response, NextFunction } from "express";
    import { createServer } from 'http';
    import activeSessions from "./util/sessionStore.js";
    import { Server as IoServer } from 'socket.io';
    import { messageGetUserById } from "./lib/messageGetUserById.js";
    import dotenv from 'dotenv';
    import cors from 'cors';
    import messageHandler from "./lib/message-handler.js";




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
            const { content, fileUrl } = req.body;
            const { channelId, serverId } = req.query;
            //TODO: Start here to address message posting issues (this is the route for bots)
            const session = await getSession(req, AuthConfig);

            if (!session) return res.status(401).json({ error: 'Session Missing!'});
            if (!serverId) return res.status(400).json({ error: 'Missing server ID!'});
            if (!channelId) return res.status(400).json({ error: 'Missing channel ID!'});

            const result = await messageHandler(session?.user?.id, serverId, channelId, fileUrl, content);

            res.status(result.status).send(result.message);
        } catch (error) {
            console.log('MESSAGE SERVER POST ERROR')
        }
    })

    io.use(socketAuthMiddleware);


    io.on('connection', (socket) => {
        //@ts-ignore
        const session = socket.session;
        const username = session?.user.username;
        // TODO: Null check here when adding guests
        const userId = session?.user.id ?? 'Guest';
        //@ts-ignore
        console.log('User ' + (username || 'Unknown') + ' connected');

        scheduleSessionRecheck(socket);

        socket.on('message', async (data) => {//@ts-ignore
            console.log('User ' + (session?.user.username || 'Unknown') + ' messaged');
            try{
            const { query, values } = data;
            const { serverId, channelId } = query;
            //TODO: add fileUrl for socket to frontend
            const fileUrl = values.fileUrl;
            const content = values.content;
            
            if (!serverId) return { status: 400, error: 'Server Id missing!'};
            if (!channelId) return { status: 400, error: 'Channel Id missing!'};

            // Send requred info to message Handler followed by emission & key
            const result = await messageHandler(userId, serverId, channelId, fileUrl, content); 

            const channelKey = `chat:${channelId}:messages`;
            io.emit(channelKey, result);
            // Emit response from message handler
            } catch (error) {
                console.log('SOCKET MESSAGE POST ERROR: ', error);
                io.emit('error', { status: 500, error: 'SOCKET MESSAGE POST ERROR'});
            }   
        })

        socket.on('disconnect', () => {//@ts-ignore
            console.log('User ' + session?.user.username || 'Unknown' + ' disconnected');
            activeSessions.delete(socket.id);
            //@ts-ignore
            clearInterval(socket.sessionInterval);
        });
    });

    server.listen(port, () => {
        console.log('Socket listening on port ' + port);
    })