import BotCarousel from "@/components/bot-display/bot-carousel/bot-carousel";
import ServerCarousel from "@/components/server-display/server-carousel/server-carousel";
import BotExplorer from "@/components/bot-display/bot-explorer/bot-explorer";
import { TemplateHeader } from "@/components/template/TemplateHeader";
import { TemplateTabs } from "@/components/template/TemplateTabs";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import ServerExplorer from "@/components/server-display/server-explorer/server-explorer";

export default async function TemplatePage() {
    const user = await currentUser();

    if (!user) {
        return redirect('/');
    }

    const featuredContent = (
        <div className="px-4 space-y-6">
            <BotCarousel title="Featured Bots" />
            <ServerCarousel title="Featured Servers" />
        </div>
    );

    const botTemplatesContent = (
        <div className="px-4">
            <BotExplorer />
        </div>
    );

    const serverTemplatesContent = (
        <div className="px-4">
            <ServerExplorer />
        </div>
    );
    
    return (
        <div className="min-h-screen pb-20">
            <TemplateTabs 
                defaultTab="featured"
                featuredContent={featuredContent}
                botTemplatesContent={botTemplatesContent}
                serverTemplatesContent={serverTemplatesContent}
            />
        </div>
    );
}