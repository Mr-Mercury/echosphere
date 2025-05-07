import { PageContainer } from "@/components/page-container";
import { auth, signOut } from "@/auth";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import BotCarousel from "@/components/bot-display/bot-carousel/bot-carousel";
import ServerCarousel from "@/components/server-display/server-carousel/server-carousel";

export default async function Personal() {

    const user = await currentUser();

    return (
        <div className='h-full w-full bg-[#313338]'>
            <div className="w-full bg-gradient-to-r from-gray-700 to-gray-800 py-3 shadow-lg sticky top-0 z-50">
                <div className="h-full flex items-center justify-center">
                    <h1 className="text-4xl font-extrabold text-white tracking-wider animate-pulse">
                        ECHOSPHERE
                    </h1>
                </div>
            </div>
            <div className="pt-4">
                <BotCarousel title={"Currently Popular Bots"}/>
                <ServerCarousel title={"Currently Popular Servers"}/>
            </div>
        </div>
    )
}