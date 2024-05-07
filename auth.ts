import NextAuth, { DefaultSession } from "next-auth";
import authConfig from "@/auth.config";
import { PrismaAdapter } from '@auth/prisma-adapter';
import { db } from "./lib/db/db";
import { getUserById } from "./lib/utilities/data/fetching/userData";
 
// Non ideal solution to TS errors, but at least it sorta works

// edge workaround for prisma
export const { auth, handlers, signIn, signOut } = NextAuth({
    pages: {
        signIn: 'login',
        error: 'error/auth'
    },
    events: {
        async linkAccount({ user }) {
            await db.user.update({
                where: { id: user.id },
                data: { emailVerified: new Date() }
            })
        }
    },
    callbacks: {
        async session({ token, session }) {
            console.log({sessionToken: token,})
            if (token.sub && session.user) {
                session.user.id = token.sub
            }

            if (token.username && session.user) {
                session.user.username = token.username
                session.user.human = token.human
            }

            return session;
        },  
        // Get by ID because it is the PRIMARY KEY, faster query
        // Extract any necessary info for the session token here. 
        async jwt({ token }) {
            if (!token.sub) return token;

            const existingUser = await getUserById(token.sub);
            if (!existingUser) return token;
            
            token.human = existingUser.human; 
            token.username = existingUser.username;
            return token;
        }
    },
    adapter: PrismaAdapter(db),
    session: { strategy: 'jwt'},
    ...authConfig,
})