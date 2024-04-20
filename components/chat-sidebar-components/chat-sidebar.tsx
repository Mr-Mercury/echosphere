import { UserType } from '@/lib/entities/user';

export const ChatMainSidebar = async (currentUser: UserType | undefined ) => {
    return (
        <div>
            <nav>Sidebar</nav>
            <nav>Chat1</nav>
            <nav>Chat2</nav>
            <nav>Chat3</nav>
            <nav>Chat4</nav>
        </div>
    )
}