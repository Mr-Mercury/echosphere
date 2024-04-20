import { UserType } from '@/lib/entities/user';

export const ChatMainSidebar = async (currentUser: UserType | undefined ) => {
    return (
        <div>
            <nav>Sidebar</nav>
            <nav>Me</nav>
            <nav>Server1</nav>
            <nav>Server2</nav>
            <nav>Server3</nav>
            <nav>Server4</nav>
        </div>
    )
}