import { Bot } from "lucide-react";

import BotCarousel from "@/components/bot-display/bot-carousel/bot-carousel";
import ServerCarousel from "@/components/server-display/server-carousel/server-carousel";
import { Separator } from "@/components/ui/separator";
import { BotExplorer } from "@/components/bot-display/bot-explorer/bot-explorer";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";

const TemplatePage = async () => {
    const user = await currentUser();

    if (!user) {
        return redirect('/');
    }

    return (
        <div>
            <BotCarousel title={"Popular Bots"}/>
            <ServerCarousel title={"Popular Servers"} />
            <Separator />
            <BotExplorer />
        </div>
    )
}  

export default TemplatePage;