//This is for setting protected & public routes - array of public routes
// Other routes will be protected.  @type {string[]}

export const publicRoutes = [
    '/',
    '/api/uploadthing'
]

/*  This is an array of routes for authentication, and will redirect logged
in users to /settings
@type {string[]}
*/

export const authRoutes = [
    '/login',
    '/registration',
    '/error/auth',
]

/*  This is the prefix for API auth routes.  Routes with the prefix are used 
 for API auth.  
 @type {string}
 */

export const apiAuthPrefix = '/api/auth';

/* Default redirect path after logging in.
@type {string}
*/ 
// TODO: Change this to chat (or dashboard) later
export const DEFAULT_LOGIN_REDIRECT = '/setup';

export const PERSONAL_ROOM_ROUTE = '/chat/server/personal';

