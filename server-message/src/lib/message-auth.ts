import { getSession } from "@auth/express"
import { Request, Response, NextFunction } from "express";
import dotenv from 'dotenv';
import cookie from 'cookie';
import fetch from 'node-fetch';

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
    const cookies = socket.handshake.headers.cookie;

    console.log(cookies);

    const response = await fetch('http://localhost:4000/authenticate', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'Cookie': cookies
      }
    });

    console.log(response);

    const data = response.json();

    //@ts-ignore
    if (response.ok) {
        //@ts-ignore
      return data.user
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
          console.log('in interval check')
          const user = await authenticateUser(socket);
          if (user) console.log('Session recheck successful for user', user?.id);
          else throw new Error('Session Invalid')
      } catch (error) {
          console.log('Session recheck failed:', error);
          socket.disconnect(true);
      }
  }, 1800000); // 30 minutes in milliseconds
}