import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/utilities/data/fetching/currentUser';
import { getServerChannelsById } from '@/lib/utilities/data/fetching/serverData';

export async function GET(
    req: Request,
    { params }: { params: { serverId: string } }
) {
    try {
        const user = await currentUser();

        if (!user || !user.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const serverId = params.serverId;

        if (!serverId) {
            return new NextResponse('Server ID missing', { status: 400 });
        }

        const serverData = await getServerChannelsById(serverId, user.id);

        if (!serverData) {
            return new NextResponse('Server not found or access denied', { status: 404 });
        }

        return NextResponse.json(serverData);

    } catch (error) {
        console.error('[SERVER_DETAILS_GET] Error:', error);
        // It's good practice to avoid sending detailed internal error messages to the client.
        // Log the detailed error on the server and send a generic message.
        let errorMessage = 'Internal Server Error';
        let statusCode = 500;

        if (error instanceof Error && error.message.includes('Invariant: headers()')) {
            // This specific error should ideally not happen here if currentUser is structured correctly
            // for server-side use with auth(). If it does, it might indicate a deeper issue
            // with how auth() is configured or used within currentUser even on the server.
            // For now, we'll log it and return a generic error.
            console.error('[SERVER_DETAILS_GET] Critical: headers() invariant error in API route context:', error);
            errorMessage = 'Configuration error'; // Or a more generic "Internal Server Error"
            statusCode = 500;
        }
        
        return new NextResponse(errorMessage, { status: statusCode });
    }
} 