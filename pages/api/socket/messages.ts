import { NextApiResponseIoServer } from "@/lib/entities/servers";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { NextApiRequest } from "next";
import { NextResponse } from "next/server";


//NOTE NEXTAUTH MAY NOT WORK WITH PAGES LOL, WHOOPS
export default async function messageHandler(
    req: NextApiRequest, res: NextApiResponseIoServer
) {
    if (req.method !== 'POST') return res.status(405).json({error: 'Method not allowed'});
        
    try {
        
        //TODO: AUTH GOES HERE

        const { content, fileUrl } = req.body;
        const { serverId, channelId } = req.query;

        if (!userId) return res.status(401).json({error: 'Unauthorized via pages messages (socket/messages)'});
        if (!serverId) return res.status(400).json({error: 'Server ID missing!'});
        if (!channelId) return res.status(400).json({error: 'Channel ID missing!'})

    } catch(error) {
        console.log('POST MESSAGE', error);
        return res.status(500).json({message: 'internal error'})
    }
}