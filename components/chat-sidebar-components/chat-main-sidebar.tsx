import { UserType } from '@/lib/entities/user';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { redirect } from 'next/navigation'
import Link from 'next/link';
import { getUser } from '@/lib/utilities/data/fetching/userData';
import ChatNewButton from './chat-new-button/chat-new-button';
import ChatNavItem from './chat-nav-item';

// Later on, pass with button component
export default async function ChatMainSidebar() {

    let user = await getUser('1234');

    if (!user) {
        return redirect('/');
    }

    return (
        <div className='space-y-4 flex flex-col items-center h-full text-white
        bg-[#1E1F22] py-3'>
            <ScrollArea className='flex-1 w-full'>
                <ul className='mb-4'>
                    {Array.from(user.servers).map(server => (
                        <li key={server.id}>
                            <ChatNavItem id={server.id} name={server.name} image={server.image}/>
                        </li>
                    ))}
                </ul>
            </ScrollArea>
            <Separator className='h-[2px] bg-zinc-600   
            rounded-md w-10 mx-auto'/>
            <ChatNewButton />
        </div>
    );
}