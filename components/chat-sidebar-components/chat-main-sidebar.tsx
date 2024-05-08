import { UserType } from '@/lib/entities/user';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { redirect } from 'next/navigation'
import ChatNewButton from './chat-new-button/chat-new-button';
import { auth } from '@/auth';
import JoinedServers from '../islets/chat-window/joined-servers';
import UserButton from '../islets/users/user-button';

// Later on, pass with button component
export default async function ChatMainSidebar() {

    let session = await auth();
    let user = session?.user;

    if (!user) {
        return redirect('/');
    }

    return (
        <div className='space-y-4 flex flex-col items-center h-full text-white
        bg-[#1E1F22] py-3'>
            <UserButton />
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
                <JoinedServers user={user} />
            </ScrollArea>
            <Separator className='h-[2px] bg-zinc-600   
            rounded-md w-10 mx-auto'/>
            <ChatNewButton />
        </div>
    );
}