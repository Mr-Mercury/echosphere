import { getSession } from "@auth/express";
import activeSessions from "../util/sessionStore.js";
import dotenv from 'dotenv';
import { ChatSocket } from "./entities/types.js";

dotenv.config();

export async function authenticateSocketSession(
  socket: ChatSocket
) {
  try {
    const cookies = socket.handshake.headers.cookie;
    
    // Properly type the headers object
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Cookie': cookies || ''
    };

    const response = await fetch('http://localhost:4000/authenticate', {
      method: 'POST',
      headers
    });

    const data = await response.json();

    if (response.ok && data.session?.user) {
      return data.session;
    } else {
      throw new Error(data.error || 'Authentication failed');
    }
  } catch (error) {
    console.log('MESSAGE AUTH FAILURE: ' + error);
    throw error;
  }
}

export async function socketAuthMiddleware(
  socket: ChatSocket,
  next: (err?: Error) => void
) {
  try {
    let session = activeSessions.get(socket.id);

    if (!session) {
      session = await authenticateSocketSession(socket);

      if (session) {
        activeSessions.set(socket.id, session);
      } else {
        throw new Error('Authentication failed');
      }
    }

    socket.data.session = session;
    next();
  } catch (error) {
    console.log('MESSAGE AUTH MIDDLEWARE ERROR: ' + error);
    next(new Error(`Unauthorized: ${error}`));
  }
}

export function scheduleSessionRecheck(socket: ChatSocket) {
  socket.data.sessionInterval = setInterval(async () => {
    try {
      const sessionData = await authenticateSocketSession(socket);
      const isSessionExpired = (sessionData: any) => 
        new Date() > new Date(sessionData.session.expires);

      if (sessionData && !isSessionExpired(sessionData)) {
        console.log('Session revalidation successful for user ', sessionData.user.id);
      } else {
        throw new Error('Session Invalid or Expired');
      }
    } catch (error) {
      console.log('Session revalidation failed: ', error);
      socket.disconnect(true);
    }
  }, 1800000); // 30 minutes in milliseconds
}