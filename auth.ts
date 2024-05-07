import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { PrismaAdapter } from '@auth/prisma-adapter';
import { db } from "./lib/db/db";
 
// edge workaround for prisma
export const { auth, handlers, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(db),
    session: { strategy: 'jwt'},
    ...authConfig,
})