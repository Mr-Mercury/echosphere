import { UserType } from "@/lib/entities/user";
import { FetchedData } from "@/app/chat/server/personal/page";

export const FriendSidebar = (data: FetchedData) => {
    return (
        <section>
            <nav>Friend1</nav>
            <nav>Friend2</nav>
            <nav>Friend3</nav>
            <nav>Friend4</nav>
            <nav>Friend5</nav>
        </section>
    )
}

export default FriendSidebar;