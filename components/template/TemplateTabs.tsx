'use client';

import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ReactNode, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { TemplateHeader } from "./TemplateHeader";
import { useSearchParams } from "next/navigation";

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
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState(defaultTab);
    
    // Update tab when URL changes
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && ['featured', 'bots', 'servers'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);
    
    return (
        <Tabs value={activeTab} defaultValue={defaultTab} className="w-full">
            <TemplateHeader activeTab={activeTab} />
            
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