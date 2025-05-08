import { Bot, Server, ChevronDown } from "lucide-react";

import BotCarousel from "@/components/bot-display/bot-carousel/bot-carousel";
import ServerCarousel from "@/components/server-display/server-carousel/server-carousel";
import { Separator } from "@/components/ui/separator";
import { BotExplorer } from "@/components/bot-display/bot-explorer/bot-explorer";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/utilities/data/fetching/currentUser";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TemplatePage = async () => {
    const user = await currentUser();

    if (!user) {
        return redirect('/');
    }

    return (
        <div className="min-h-screen pb-20">
            {/* Single Tabs component that controls both navigation and content */}
            <Tabs defaultValue="featured" className="w-full">
                {/* Sticky Navigation Bar */}
                <div className="sticky top-0 z-10 bg-background border-b border-border py-2 px-4 mb-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold justify-center">Template Library</h1>
                        <div className="flex items-center space-x-2">
                            <Button size="sm" className="gap-1" variant="default">
                                <Bot className="h-4 w-4" />
                                Create Template
                            </Button>
                        </div>
                    </div>
                    
                    {/* Section Navigation */}
                    <div className="mt-2">
                        <TabsList className="grid w-full max-w-md grid-cols-3">
                            <TabsTrigger value="featured">Featured</TabsTrigger>
                            <TabsTrigger value="bots">Bot Templates</TabsTrigger>
                            <TabsTrigger value="servers">Server Templates</TabsTrigger>
                        </TabsList>
                    </div>
                </div>

                <div className="px-4">
                    {/* Featured Content Tab */}
                    <TabsContent value="featured" className="space-y-6">
                        <section className="space-y-2">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold">Popular Bots</h2>
                                <Button variant="link" size="sm" className="gap-1">
                                    Show More <ChevronDown className="h-4 w-4" />
                                </Button>
                            </div>
                            <BotCarousel title={""} />
                        </section>
                        
                        <section className="space-y-2">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold">Popular Servers</h2>
                                <Button variant="link" size="sm" className="gap-1">
                                    Show More <ChevronDown className="h-4 w-4" />
                                </Button>
                            </div>
                            <ServerCarousel title={""} />
                        </section>
                    </TabsContent>
                    
                    {/* Bot Templates Tab */}
                    <TabsContent value="bots">
                        <div className="flex justify-end mb-6">
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm">All Templates</Button>
                                <Button variant="ghost" size="sm">My Templates</Button>
                            </div>
                        </div>
                        <BotExplorer />
                    </TabsContent>
                    
                    {/* Server Templates Tab */}
                    <TabsContent value="servers">
                        <div className="flex justify-end mb-6">
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm">All Templates</Button>
                                <Button variant="ghost" size="sm">My Templates</Button>
                            </div>
                        </div>
                        <div className="text-center py-12 text-muted-foreground">
                            <Server className="h-16 w-16 mx-auto mb-4 opacity-40" />
                            <h3 className="text-xl font-semibold mb-2">Server Explorer Coming Soon</h3>
                            <p>We're working on making server templates available.</p>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
};

export default TemplatePage;