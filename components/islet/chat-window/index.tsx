import { ServerType } from "@/lib/entities/server"

const ServerChat = (server: ServerType) => {
    
    const data = server.server;

    return (
        <div>
            <h1>{data.name}</h1>
            <p>{data.id}</p>
        </div>
    )
}

export default ServerChat;