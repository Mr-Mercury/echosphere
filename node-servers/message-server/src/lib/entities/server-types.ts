import { Socket } from 'socket.io';
import type { Session, User as AuthUser } from '@auth/core/types';
import type { JWT } from 'next-auth/jwt';



interface CustomSession extends Session {
    user?: User;
    [key: string]: any;
}

export interface ChatSocket extends Socket {
    data: {
        session?: CustomSession;
        sessionInterval?: NodeJS.Timeout;
    };
}

export interface User extends AuthUser {
    username: string;
    human: boolean;
    [key: string]: any;
}

export interface Token extends JWT {
    sub?: string;
    username: string;
    human: boolean;
    [key: string]: any;
}

export interface SessionCallback {
    session: Session;
    token: Token;
}
