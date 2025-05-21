import { getSession } from "@auth/express";
import { Session } from "@auth/express";
import activeSessions from "../../util/sessionStore.js";
import dotenv from 'dotenv';
import type { ChatSocket } from "../entities/server-types.js";

dotenv.config();

const INTERNAL_AUTH_URL = process.env.INTERNAL_AUTH_URL || 'http://localhost:4000/authenticate';
const SESSION_RECHECK_INTERVAL_MS = parseInt(process.env.SESSION_RECHECK_INTERVAL_MS || '300000', 10); // Default 5 minutes

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

    const response = await fetch(INTERNAL_AUTH_URL, {
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

function isSessionExpired(sessionData: Session | null): boolean {
  //Null check
  if (!sessionData?.expires) {
    return true;
  }
  return new Date(sessionData.expires) < new Date();
}
export function scheduleSessionRecheck(socket: ChatSocket) {
  const interval = setInterval(async () => {
    try {
      const currentSession = socket.data.session;

      if (!currentSession) {
        socket.disconnect();
        return;
      }

      if (isSessionExpired(currentSession)) {
        console.log('Session expired for user ', currentSession?.user?.username || 'Unknown User');
        socket.disconnect();
        return;
      }

      //TODO: insert refresh logic here?  Or maybe call a separate function
      // Remember to add code on frontend to refresh session if it expires

    } catch (error) {
      console.error('Session revalidation error: ', error);
      socket.disconnect();
    }
  }, SESSION_RECHECK_INTERVAL_MS); // Use configured interval

  socket.data.sessionInterval = interval;
}