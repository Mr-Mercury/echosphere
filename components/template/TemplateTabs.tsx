'use client';

import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { TemplateHeader } from "./TemplateHeader";

interface TemplateTabsProps {
    defaultTab: string;
    featuredContent: ReactNode;
    botTemplatesContent: ReactNode;
    serverTemplatesContent: ReactNode;
}

export function TemplateTabs({ 
    defaultTab,
    featuredContent,
    botTemplatesContent,
    serverTemplatesContent
}: TemplateTabsProps) {
    return (
        <Tabs defaultValue={defaultTab} className="w-full">
            <TemplateHeader activeTab={defaultTab} />
            
            <div className="mt-4">
                <TabsContent value="featured">
                    {featuredContent}
                </TabsContent>
                
                <TabsContent value="bots">
                    <div className="flex justify-end px-4 mb-6">
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm">All Templates</Button>
                            <Button variant="ghost" size="sm">My Templates</Button>
                        </div>
                    </div>
                    {botTemplatesContent}
                </TabsContent>
                
                <TabsContent value="servers">
                    <div className="flex justify-end px-4 mb-6">
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm">All Templates</Button>
                            <Button variant="ghost" size="sm">My Templates</Button>
                        </div>
                    </div>
                    {serverTemplatesContent}
                </TabsContent>
            </div>
        </Tabs>
    );
} 