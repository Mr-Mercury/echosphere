import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import BotCarousel from "@/components/bot-display/bot-carousel/bot-carousel";
import ServerCarousel from "@/components/server-display/server-carousel/server-carousel";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Personal() {
    const user = await currentUser();

    return (
        <div className='w-full'>
            <div className="w-full bg-gradient-to-r from-zinc-800 to-zinc-900 to-zinc-800 py-3 shadow-lg sticky top-0 z-50">
                <div className="h-full flex items-center justify-center">
                    <h1 className="text-4xl font-extrabold text-white tracking-wider animate-pulse">
                        ECHOSPHERE
                    </h1>
                </div>
            </div>
            <div className="pt-4">
                <div className="flex items-center justify-between px-4 mb-2">
                    <h2 className="text-xl font-semibold">Currently Popular Bots</h2>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/chat/template?tab=bots">
                            Explore Bot Templates
                        </Link>
                    </Button>
                </div>
                <BotCarousel title={"Currently Popular Bots"}/>
                
                <div className="flex items-center justify-between px-4 mb-2 mt-6">
                    <h2 className="text-xl font-semibold">Currently Popular Servers</h2>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/chat/template?tab=servers">
                            Explore Server Templates
                        </Link>
                    </Button>
                </div>
                <ServerCarousel title={"Currently Popular Servers"}/>
            </div>
        </div>
    )
}