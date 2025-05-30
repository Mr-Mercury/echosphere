import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { redirect } from 'next/navigation'
import ChatNewButton from './chat-new-button';
import { currentUser } from '@/lib/utilities/data/fetching/currentUser';
import JoinedServers from '../islets/chat-window/joined-servers';
import UserButton, { UserWithImage } from '../islets/users/user-button';

// Later on, pass with button component
export default async function ChatMainSidebar() {

    const user = await currentUser();

    if (!user) {
        return redirect('/');
    }

    return (
        <div className='space-y-4 flex flex-col items-center h-full text-white
        bg-[#1E1F22] py-3'>
            <UserButton user={user as UserWithImage} />
            <Separator className='h-[2px] bg-zinc-600   
            rounded-md w-10 mx-auto'/>
            <ScrollArea className='flex-1 w-full'>
                {/* <ul className='mb-4'>
                    {Array.from(user.servers).map(server => (
                        <li key={server.id}>
                            <ChatNavItem id={server.id} name={server.name} image={server.image}/>
                        </li>
                    ))}
                </ul> */}
                <JoinedServers />
            </ScrollArea>
            <Separator className='h-[2px] bg-zinc-600   
            rounded-md w-10 mx-auto'/>
            <ChatNewButton />
        </div>
    );
}