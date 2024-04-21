import { UserType } from '@/lib/entities/user';
import Link from 'next/link';

// Later on, pass with button component
export default function ChatMainSidebar(currentUser: UserType) {
    return (
        <ul>
            {Array.from(currentUser.servers).map(server => (
                <li key={server.id}>
                    <Link href={`/chat/server/${server.id}`}>{server.name}</Link>
                </li>
            ))}
        </ul>
    );
}