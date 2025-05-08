'use client';

import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { useModal } from "@/hooks/use-modal-store";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TemplateHeaderProps {
    activeTab: string;
}

export function TemplateHeader({ activeTab }: TemplateHeaderProps) {
    const { onOpen } = useModal();
    
    return (
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
            <div className="relative flex items-center px-4 h-14">
                <div className="flex-1">
                    <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-zinc-900/50 p-1 text-muted-foreground">
                        <TabsTrigger 
                            value="featured" 
                            className="rounded-md px-3 data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
                        >
                            Featured
                        </TabsTrigger>
                        <TabsTrigger 
                            value="bots" 
                            className="rounded-md px-3 data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
                        >
                            Bot Templates
                        </TabsTrigger>
                        <TabsTrigger 
                            value="servers" 
                            className="rounded-md px-3 data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
                        >
                            Server Templates
                        </TabsTrigger>
                    </TabsList>
                </div>
                
                <h1 className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-semibold">
                    Template Library
                </h1>
                
                <div className="flex-1 flex justify-end">
                    <Button 
                        size="sm" 
                        className="gap-1 hover:bg-zinc-800/80 hover:ring-2 hover:ring-white/50 transition-all bg-background/50 backdrop-blur-sm" 
                        onClick={() => onOpen('createTemplate')}
                    >
                        <Bot className="h-4 w-4" />
                        Create Template
                    </Button>
                </div>
            </div>
        </div>
    );
} 