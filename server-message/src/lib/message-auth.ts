import { getSession } from "@auth/express"
import { Request, Response, NextFunction } from "express";
import dotenv from 'dotenv';

dotenv.config();

const AuthConfig = {
  secret: process.env.AUTH_SECRET,
  providers: [],
}

export async function authenticateUser(
  //@ts-ignore
  socket
) {
  try {
    const cookies = socket.request.cookies;
    const sessionToken = cookies['authjs.session-token'];

    if (cookies && sessionToken) {
      const session = await getSession(sessionToken, AuthConfig);
      console.log(session);
      if (session && session.user) return session.user;
    }
    throw new Error('Invalid session');
  } catch (error) {
    console.log('MESSAGE AUTH FAILURE: ' + error);
  }
}

//@ts-ignore
export async function socketAuthMiddleware(socket, next) {
  try {
    console.log(socket.request.cookies);
    const user = await authenticateUser(socket);
    socket.user = user;
    next();
  } catch (error) {
    console.log('MESSAGE AUTH MIDDLEWARE ERROR' + error);
    next(new Error('Unauthorized:' + error))
  }
}

//@ts-ignore
export function scheduleSessionRecheck(socket) {
  socket.sessionInterval = setInterval(async () => {
      try {
          const user = await authenticateUser(socket);
          console.log('Session recheck successful for user', user?.id);
      } catch (error) {
          console.log('Session recheck failed:', error);
          socket.disconnect(true);
      }
  }, 1800000); // 30 minutes in milliseconds
}