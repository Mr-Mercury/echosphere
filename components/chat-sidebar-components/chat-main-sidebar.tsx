import { UserType } from '@/lib/entities/user';
import { useMemo } from 'react';
import { atom, useAtom } from 'jotai';
import { userDataAtom } from '@/lib/entities/atoms/userDataAtom';
import Link from 'next/link';
import { getUser } from '@/lib/utils/data/fetching/userData';

// Later on, pass with button component
export default async function ChatMainSidebar() {

    let user = await getUser('1234');

    return (
        <ul>
            {Array.from(user.servers).map(server => (
                <li key={server.id}>
                    <Link href={`/chat/server/${server.id}`}>{server.name}</Link>
                </li>
            ))}
        </ul>
    );
}