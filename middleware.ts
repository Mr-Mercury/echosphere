import authConfig from "@/auth.config";
import NextAuth from "next-auth";
import { DEFAULT_LOGIN_REDIRECT, apiAuthPrefix, authRoutes, publicRoutes } from "./routes";

const { auth } = NextAuth(authConfig);
//Auth middleware - uses req.nextUrl.pathname and req.auth to determine 
// permissions.  Routes are protected by default. 

export default auth((req) => {
    const { nextUrl } = req;

    const isLoggedin= !!req.auth;
    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);  
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
    const isAuthRoute = authRoutes.includes(nextUrl.pathname);

    if (isApiAuthRoute) {
        return new Response(null, { status: 204}); 
    }

    if (isAuthRoute) {
        if (isLoggedin) {
            return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
        }
        return new Response(null, { status: 204});
    }

    if (!isLoggedin && !isPublicRoute) {
        return Response.redirect(new URL('/login', nextUrl));
    }

    return new Response(null, { status: 204}); 
})
 
// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}