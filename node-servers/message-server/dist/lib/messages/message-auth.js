import activeSessions from "../../util/sessionStore.js";
import dotenv from 'dotenv';
dotenv.config();
export async function authenticateSocketSession(socket) {
    try {
        const cookies = socket.handshake.headers.cookie;
        // Properly type the headers object
        const headers = {
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
        }
        else {
            throw new Error(data.error || 'Authentication failed');
        }
    }
    catch (error) {
        console.log('MESSAGE AUTH FAILURE: ' + error);
        throw error;
    }
}
export async function socketAuthMiddleware(socket, next) {
    try {
        let session = activeSessions.get(socket.id);
        if (!session) {
            session = await authenticateSocketSession(socket);
            if (session) {
                activeSessions.set(socket.id, session);
            }
            else {
                throw new Error('Authentication failed');
            }
        }
        socket.data.session = session;
        next();
    }
    catch (error) {
        console.log('MESSAGE AUTH MIDDLEWARE ERROR: ' + error);
        next(new Error(`Unauthorized: ${error}`));
    }
}
function isSessionExpired(sessionData) {
    //Null check
    if (!sessionData?.expires) {
        return true;
    }
    return new Date(sessionData.expires) < new Date();
}
export function scheduleSessionRecheck(socket) {
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
        }
        catch (error) {
            console.error('Session revalidation error: ', error);
            socket.disconnect();
        }
    }, 5 * 60 * 1000); // TODO: Check best practicies (5 mins atm)
    socket.data.sessionInterval = interval;
}
//# sourceMappingURL=message-auth.js.map