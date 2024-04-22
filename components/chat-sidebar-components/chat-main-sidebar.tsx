import { UserType } from '@/lib/entities/user';
import { redirect } from 'next/navigation'
import Link from 'next/link';
import { getUser } from '@/lib/utils/data/fetching/userData';

// Later on, pass with button component
export default async function ChatMainSidebar() {

    let user = await getUser('1234');

    if (!user) {
        return redirect('/');
    }



    return (
        <ul className='space-y-4 flex flex-col items-center h-full text-primary
        w-full dark:bg-[#1E1F22] py-3'>
            {Array.from(user.servers).map(server => (
                <li key={server.id}>
                    <Link href={`/chat/server/${server.id}`}>{server.name}</Link>
                </li>
            ))}
        </ul>
    );
}