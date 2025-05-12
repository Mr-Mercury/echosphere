import BotCarousel from "@/components/bot-display/bot-carousel/bot-carousel";
import ServerCarousel from "@/components/server-display/server-carousel/server-carousel";
import BotExplorer from "@/components/bot-display/bot-explorer/bot-explorer";
import { TemplateHeader } from "@/components/template/TemplateHeader";
import { TemplateTabs } from "@/components/template/TemplateTabs";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import ServerExplorer from "@/components/server-display/server-explorer/server-explorer";

interface TemplatePageProps {
    searchParams: { tab?: string };
}

export default async function TemplatePage({ searchParams }: TemplatePageProps) {
    const user = await currentUser();

    if (!user) {
        return redirect('/');
    }

    // Get tab from URL query parameter or default to "featured"
    const tab = searchParams.tab && ['featured', 'bots', 'servers'].includes(searchParams.tab) 
        ? searchParams.tab 
        : 'featured';

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
                defaultTab={tab}
                featuredContent={featuredContent}
                botTemplatesContent={botTemplatesContent}
                serverTemplatesContent={serverTemplatesContent}
            />
        </div>
    );
}