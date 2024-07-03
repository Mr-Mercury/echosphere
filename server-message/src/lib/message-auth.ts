import { getSession } from "@auth/express";
import activeSessions from "../util/sessionStore.js";
import { Request, Response, NextFunction } from "express";
import dotenv from 'dotenv';
import cookie from 'cookie';
import fetch from 'node-fetch';

dotenv.config();

export async function authenticateSocketSession(
  //@ts-ignore
  socket
) {
  try {
    const cookies = socket.handshake.headers.cookie;

    const response = await fetch('http://localhost:4000/authenticate', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'Cookie': cookies
      }
    });

    const data = await response.json();

    //@ts-ignore
    if (response.ok && data.user) {
        //@ts-ignore
      return data
    } else {
      //@ts-ignore
      throw new Error(data.error || 'Authentication failed')
    };
  } catch (error) {
    console.log('MESSAGE AUTH FAILURE: ' + error);
  }
}

//@ts-ignore
export async function socketAuthMiddleware(socket, next) {
  try {
    const session = await authenticateSocketSession(socket);
    
    if (session) {
      activeSessions.set(socket.id, session);
      next();
    }
  } catch (error) {
    console.log('MESSAGE AUTH MIDDLEWARE ERROR' + error);
    next(new Error('Unauthorized:' + error))
  }
}

//@ts-ignore
export function scheduleSessionRecheck(socket) {
  socket.sessionInterval = setInterval(async () => {
      try {
          const session = await authenticateSocketSession(socket);//@ts-ignore
          if (session) console.log('Session revalidation successful for user', session?.user?.id);
          else throw new Error('Session Invalid')
      } catch (error) {
          console.log('Session revalidation failed:', error);
          socket.disconnect(true);
      }
  }, 1800000); // 30 minutes in milliseconds
}