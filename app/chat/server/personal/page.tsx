import { PageContainer } from "@/components/page-container";
import { auth, signOut } from "@/auth";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import BotCarousel from "@/components/bot-display/bot-carousel/bot-carousel";

export default async function Personal() {

    const user = await currentUser();

    return (
        <div className='relative min-h-screen w-full'>
            <p className='justify-self-center pt-20 text-center text-2xl font-bold'>ECHOSPHERE</p>
            <BotCarousel title={"Currently Popular Bots"}/>
            <ul className='absolute top-[66%] left-1/2 -translate-x-1/2'>
                Popular Servers
            </ul>
        </div>
    )

}