import { SingleChannel } from "@/lib/entities/channel";

const ChatWindow = (info: SingleChannel) => {
    return (
        <div>
            <p>{info.id}</p>
        </div>
    )
}

export default ChatWindow;