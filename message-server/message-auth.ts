const { ExpressAuth } = require('@auth/express');
const { db } = require('./lib/messageDbConnection');

async function currentUser(sessionToken) {
    if (!sessionToken) return null;

    const session = await ExpressAuth();
    
    
    const id = sessionToken.user.id;
}


