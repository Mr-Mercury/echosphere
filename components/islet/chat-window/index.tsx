import { ServerType } from "@/lib/entities/server"

const ServerChat = (server: ServerType) => {
    console.log(server);
    return (
        <div>
            <h1>{server.name}</h1>
            <p>{server.id}</p>
        </div>
    )
}

export default ServerChat;