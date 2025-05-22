import ServerCarousel from "@/components/server-display/server-carousel/server-carousel";
import { TemplateTabs } from "@/components/template/TemplateTabs";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import ServerExplorer from "@/components/server-display/server-explorer/server-explorer";
import PopularBotsContainer from "@/components/bot-display/bot-carousel/popular-bots-container";
import BotExplorerContainer from "@/components/bot-display/bot-explorer/bot-explorer-container";
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
            <PopularBotsContainer title="Featured Bots" />
            <ServerCarousel title="Featured Servers" />
        </div>
    );

    const botTemplatesContent = (
        <div className="px-4">
            <BotExplorerContainer currentUserId={user.id} />
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
                userId={user.id}
                featuredContent={featuredContent}
                botTemplatesContent={botTemplatesContent}
                serverTemplatesContent={serverTemplatesContent}
            />
        </div>
    );
}