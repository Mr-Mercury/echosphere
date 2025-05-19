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
                    {botTemplatesContent}
                </TabsContent>
                
                <TabsContent value="servers">
                    {serverTemplatesContent}
                </TabsContent>
            </div>
        </Tabs>
    );
} 