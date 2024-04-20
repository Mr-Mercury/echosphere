import { ServerType } from "@/lib/entities/server"

const ChatWindow = (server: ServerType) => {
    return (
        <div>
            <h1>{server.name}</h1>
            <p>{server.id}</p>
        </div>
    )
}

export default ChatWindow;