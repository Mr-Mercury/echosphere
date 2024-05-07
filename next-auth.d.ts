import NextAuth, { type DefaultSession } from "next-auth";
import { JWT } from '@auth/core/jwt';

//Bizarre TS workaround - auth.js TS solution does not work. Extending the 
// JWT interface and session interface in next-auth along w exporting 
// a new type does seem to work.  
export type ExtendedUser = DefaultSession['user'] & {
    human?: boolean;
    username: string | null;
}

declare module 'next-auth' {
    interface Session {
        user: ExtendedUser;
    }
};

declare module '@auth/core/jwt' {
    interface JWT{
        human?: boolean;
        username?: string | null;
    }
}
