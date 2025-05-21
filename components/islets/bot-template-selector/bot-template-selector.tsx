'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot } from '@/lib/entities/bot-display-types'; // Assuming Bot type is suitable for display
import { useDebounce } from '@/hooks/use-debounce'; // Assuming you have or will create this hook
import { Loader2, Search, X, PackageSearch, PlusCircle, CheckCircle } from 'lucide-react';
import NavTooltip from "@/components/server-listing-sidebar-components/nav-tooltip"; // Import user's NavTooltip
import BotCard, { ActionButtonConfig } from '@/components/bot-display/bot-card/bot-card'; // Import ActionButtonConfig

// TODO: Create a more compact Bot display card if BotCard is too large for this context

interface BotTemplateSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    currentUserId: string; // Needed for "My Templates"
    selectedBotIds: string[];
    onSelectBot: (botId: string) => void;
    maxSelection?: number; // Optional: if you want to limit total selections
}

const BOT_PAGE_SIZE = 9; // Number of bots to fetch per page

const BotTemplateSelector: React.FC<BotTemplateSelectorProps> = ({
    isOpen,
    onClose,
    currentUserId,
    selectedBotIds,
    onSelectBot,
    maxSelection
}) => {
    const [activeTab, setActiveTab] = useState('my-templates');
    // const { onOpen } = useModal(); // No longer opening a global detail modal
    const [detailedBot, setDetailedBot] = useState<Bot | null>(null); // State for the detail view
    
    // States for each tab
    const [myTemplates, setMyTemplates] = useState<Bot[]>([]);
    const [myTemplatesPage, setMyTemplatesPage] = useState(1);
    const [hasMoreMyTemplates, setHasMoreMyTemplates] = useState(true);
    const [loadingMyTemplates, setLoadingMyTemplates] = useState(false);

    const [popularTemplates, setPopularTemplates] = useState<Bot[]>([]);
    const [loadingPopular, setLoadingPopular] = useState(false);

    const [searchResults, setSearchResults] = useState<Bot[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchPage, setSearchPage] = useState(1);
    const [hasMoreSearch, setHasMoreSearch] = useState(true);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    const loadMyTemplates = useCallback(async (page: number) => {
        console.log('[BotTemplateSelector] loadMyTemplates called for page:', page, 'with currentUserId:', currentUserId);
        if (loadingMyTemplates || !currentUserId) {
            console.log('[BotTemplateSelector] loadMyTemplates skipped. Loading:', loadingMyTemplates, 'Has currentUserId:', !!currentUserId);
            return;
        }
        setLoadingMyTemplates(true);
        console.log('[BotTemplateSelector] Attempting to fetch my templates...');
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                pageSize: BOT_PAGE_SIZE.toString(),
                sort: 'recent',
            });
            if (currentUserId) params.append('creatorId', currentUserId);

            const response = await fetch(`/api/bot-templates/filter?${params.toString()}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.statusText}`);
            }
            const { bots, total } = await response.json();
            
            console.log('[BotTemplateSelector] Fetched my templates:', bots, 'Total:', total);
            setMyTemplates(prev => {
                const newTemplates = page === 1 ? bots : [...prev, ...bots];
                console.log('[BotTemplateSelector] Updating myTemplates state to:', newTemplates);
                return newTemplates;
            });
            setHasMoreMyTemplates(bots.length === BOT_PAGE_SIZE && (page * BOT_PAGE_SIZE) < total);
            console.log('[BotTemplateSelector] hasMoreMyTemplates set to:', bots.length === BOT_PAGE_SIZE && (page * BOT_PAGE_SIZE) < total);
        } catch (error) {
            console.error("[BotTemplateSelector] Failed to load user's bot templates:", error);
            // TODO: Add user feedback
        }
        setLoadingMyTemplates(false);
        console.log('[BotTemplateSelector] loadMyTemplates finished.');
    }, [currentUserId]);

    const loadPopularTemplates = useCallback(async () => {
        if (loadingPopular) return;
        setLoadingPopular(true);
        try {
            const response = await fetch('/api/bot-templates/popular');
            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.statusText}`);
            }
            const bots = await response.json();
            setPopularTemplates(bots);
        } catch (error) {
            console.error("Failed to load popular bot templates:", error);
        }
        setLoadingPopular(false);
    }, []);

    const loadSearchResults = useCallback(async (query: string, page: number) => {
        if (loadingSearch || !query) {
            if (!query) setSearchResults([]); // Clear results if query is empty
            return;
        }
        setLoadingSearch(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                pageSize: BOT_PAGE_SIZE.toString(),
                searchQuery: query,
                sort: 'popular',
            });

            const response = await fetch(`/api/bot-templates/filter?${params.toString()}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.statusText}`);
            }
            const { bots, total } = await response.json();

            setSearchResults(prev => page === 1 ? bots : [...prev, ...bots]);
            setHasMoreSearch(bots.length === BOT_PAGE_SIZE && (page * BOT_PAGE_SIZE) < total);
        } catch (error) {
            console.error("Failed to load search results:", error);
        }
        setLoadingSearch(false);
    }, []);

    // Initial load and tab change effects
    useEffect(() => {
        if (isOpen && activeTab === 'my-templates') {
            setMyTemplates([]); // Reset on tab open if desired, or keep existing
            setMyTemplatesPage(1);
            loadMyTemplates(1);
        }
    }, [isOpen, activeTab, loadMyTemplates]);

    useEffect(() => {
        if (isOpen && activeTab === 'popular') {
            loadPopularTemplates();
        }
    }, [isOpen, activeTab, loadPopularTemplates]);

    useEffect(() => {
        setSearchResults([]);
        setSearchPage(1);
        if (isOpen && activeTab === 'search' && debouncedSearchQuery) {
            loadSearchResults(debouncedSearchQuery, 1);
        } else if (!debouncedSearchQuery) {
            setSearchResults([]);
        }
    }, [isOpen, activeTab, debouncedSearchQuery, loadSearchResults]);

    const renderBotList = (bots: Bot[], isLoading: boolean, loadMore?: () => void, hasMore?: boolean) => {
        if (isLoading && bots.length === 0) {
            return <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin" /></div>;
        }
        if (bots.length === 0 && !isLoading) {
            return <p className="text-center text-zinc-400 py-4">No bot templates found.</p>;
        }
        return (
            <ScrollArea className="h-[calc(100%-0px)]"> {/* Adjust height if needed */}
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-4 p-2"> {/* More items per row for smaller circular images */}
                    {bots.map(bot => {
                        const isSelected = selectedBotIds.includes(bot.id);
                        return (
                            <NavTooltip key={bot.id} label={bot.name} side="bottom" align="center">
                                <div 
                                    className={`relative p-0.5 rounded-full cursor-pointer transform transition-all duration-150 ease-in-out hover:scale-110 focus:outline-none ${detailedBot?.id === bot.id ? 'ring-2 ring-blue-500 ring-offset-1 ring-offset-zinc-900' : ''} ${isSelected ? 'ring-2 ring-green-500 ring-offset-1 ring-offset-zinc-900' : 'ring-1 ring-zinc-700 hover:ring-indigo-400'}`}
                                    onClick={() => setDetailedBot(bot)} // Click to show details
                                    onDoubleClick={() => { // Double click to select/deselect
                                        if (isSelected || (maxSelection === undefined || selectedBotIds.length < maxSelection)) {
                                            onSelectBot(bot.id);
                                        }
                                    }}
                                    tabIndex={0} // Make it focusable
                                    onKeyDown={(e) => { // Allow selection with Enter/Space if focused
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            if (isSelected || (maxSelection === undefined || selectedBotIds.length < maxSelection)) {
                                                onSelectBot(bot.id);
                                            }
                                        }
                                    }}
                                >
                                    <img 
                                        src={bot.imageUrl || 'https://utfs.io/f/1c8f7f2e-3f5e-47f7-9b7e-9d9f1f6a3b5c-1q2w3e.png'} 
                                        alt={bot.name}
                                        className="w-16 h-16 rounded-full object-cover bg-zinc-700"
                                    />
                                    {isSelected && (
                                        <div className="absolute top-0 right-0 bg-green-500 text-white rounded-full p-0.5 w-5 h-5 flex items-center justify-center text-xs border-2 border-zinc-900">
                                            ✓
                                        </div>
                                    )}
                                </div>
                            </NavTooltip>
                        );
                    })}
                </div>
                {hasMore && loadMore && (
                    <div className="flex justify-center mt-4">
                        <Button variant="outline" onClick={loadMore} disabled={isLoading}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Load More
                        </Button>
                    </div>
                )}
            </ScrollArea>
        );
    };
    
    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl h-[80vh] flex flex-col bg-zinc-900 text-white border-zinc-700">
                <DialogHeader className="shrink-0">
                    <DialogTitle>Select Bot Templates</DialogTitle>
                    <DialogDescription>
                        Click a bot to see details. Double-click or press Enter/Space to select/deselect.
                        {maxSelection && ` You can select up to ${maxSelection} bots.`} Selected: {selectedBotIds.length}
                    </DialogDescription>
                </DialogHeader>
                
                <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden p-1">
                    {/* Tabs and Bot List Section ( occupies 2/3 width on md screens) */}
                    <div className="md:col-span-2 flex flex-col overflow-hidden">
                        <Tabs value={activeTab} onValueChange={(tab) => {setActiveTab(tab); setDetailedBot(null);}} className="w-full flex flex-col flex-grow">
                            <TabsList className="grid w-full grid-cols-3 bg-zinc-800 shrink-0">
                                <TabsTrigger value="my-templates">My Templates</TabsTrigger>
                                <TabsTrigger value="popular">Popular</TabsTrigger>
                                <TabsTrigger value="search">Search All</TabsTrigger>
                            </TabsList>
                            <div className="flex-grow overflow-auto mt-2">
                                <TabsContent value="my-templates" className="h-full">
                                    {renderBotList(myTemplates, loadingMyTemplates, () => { setMyTemplatesPage(p => p + 1); loadMyTemplates(myTemplatesPage + 1); }, hasMoreMyTemplates)}
                                </TabsContent>
                                <TabsContent value="popular" className="h-full">
                                    {renderBotList(popularTemplates, loadingPopular)}
                                </TabsContent>
                                <TabsContent value="search" className="h-full flex flex-col">
                                    <div className="flex items-center space-x-2 mb-2 shrink-0 p-1">
                                        <Search className="h-5 w-5 text-zinc-400"/>
                                        <Input 
                                            placeholder="Search by name, description, or prompt..." 
                                            value={searchQuery} 
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="bg-zinc-800 border-zinc-700 focus-visible:ring-indigo-500"
                                        />
                                        {searchQuery && (
                                            <Button variant="ghost" size="icon" onClick={() => setSearchQuery('')}>
                                                <X className="h-5 w-5"/>
                                            </Button>
                                        )}
                                    </div>
                                    <div className="flex-grow overflow-auto">
                                        {renderBotList(searchResults, loadingSearch, () => { setSearchPage(p => p + 1); loadSearchResults(debouncedSearchQuery, searchPage + 1); }, hasMoreSearch)}
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>

                    {/* Detail Pane Section ( occupies 1/3 width on md screens) */}
                    <div className="hidden md:block md:col-span-1 bg-zinc-800/50 rounded-lg p-4 overflow-y-auto">
                        {detailedBot ? (
                            () => {
                                const isSelected = selectedBotIds.includes(detailedBot.id);
                                const buttonConfig: ActionButtonConfig = {
                                    text: isSelected ? "Deselect Bot" : "Select Bot",
                                    icon: isSelected ? CheckCircle : PlusCircle,
                                    onClick: () => {
                                        if (isSelected || (maxSelection === undefined || selectedBotIds.length < maxSelection) || !isSelected ) {
                                            onSelectBot(detailedBot.id);
                                        }
                                        // Optionally, clear detailedBot view after selection or if it's deselected and no longer in selectedBotIds
                                        // if (isSelected && !selectedBotIds.includes(detailedBot.id)) setDetailedBot(null);
                                    }
                                };
                                return <BotCard {...detailedBot} actionButtonConfig={buttonConfig} />;
                            }
                        )() : (
                            <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                                <PackageSearch className="h-16 w-16 mb-4" /> {/* Example Icon */}
                                <p className="text-center">Click on a bot to see its details here.</p>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="mt-auto shrink-0">
                    <Button variant="outline" onClick={onClose}>Done</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default BotTemplateSelector; 