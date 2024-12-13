import { PageContainer } from "@/components/page-container";
import { auth, signOut } from "@/auth";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";


export default async function Personal() {

    const user = await currentUser();

    return (
        <div className='relative min-h-screen w-full'>
            <p className='justify-self-center pt-20 text-center text-2xl font-bold'>ECHOSPHERE</p>
            <ul className='absolute top-[33%] left-1/2 -translate-x-1/2'>
                Popular Bots
            </ul>
            <ul className='absolute top-[66%] left-1/2 -translate-x-1/2'>
                Popular Servers
            </ul>
        </div>
    )

}