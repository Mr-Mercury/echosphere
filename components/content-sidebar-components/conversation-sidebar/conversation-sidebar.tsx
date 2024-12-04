import { ConversationHeader } from "@/components/islets/section/conversation-header";
import { UserAvatar } from "@/components/islets/users/user-avatar";
import { User } from "@prisma/client";

interface activeConversationListType {
    id: string;
    username: string;
    image: string;
}

export const ConversationSidebar = ({activeConversations}: {activeConversations: activeConversationListType[]}) => {
    return (
        <section>
            <ConversationHeader />
            {activeConversations.map((conversation: activeConversationListType) => (
                <div key={conversation.id}>
                    <UserAvatar src={conversation.image} className='h-8 w-8 md:h-8 md:w-8 mr-2'/>
                    <p>{conversation.username}</p>
                </div>
            ))}
        </section>
    )
}

export default ConversationSidebar;