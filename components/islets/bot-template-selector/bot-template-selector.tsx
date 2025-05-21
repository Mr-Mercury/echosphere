'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot } from '@/lib/entities/bot-display-types'; // Assuming Bot type is suitable for display
import { fetchBotTemplatesWithFiltersCached, fetchPopularBotTemplatesWithRevalidation } from '@/lib/utilities/data/fetching/botTemplates';
import { useDebounce } from '@/hooks/use-debounce'; // Assuming you have or will create this hook
import { Loader2, Search, X } from 'lucide-react';

// TODO: Create a more compact Bot display card if BotCard is too large for this context
import BotCard from '@/components/bot-display/bot-card/bot-card'; 

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
        if (loadingMyTemplates || !currentUserId) return;
        setLoadingMyTemplates(true);
        try {
            const { bots, total } = await fetchBotTemplatesWithFiltersCached({
                page,
                pageSize: BOT_PAGE_SIZE,
                creatorId: currentUserId, 
                sort: 'recent' 
            });
            setMyTemplates(prev => page === 1 ? bots : [...prev, ...bots]);
            setHasMoreMyTemplates(bots.length === BOT_PAGE_SIZE && (page * BOT_PAGE_SIZE) < total);
        } catch (error) {
            console.error("Failed to load user's bot templates:", error);
            // TODO: Add user feedback
        }
        setLoadingMyTemplates(false);
    }, [currentUserId, loadingMyTemplates]);

    const loadPopularTemplates = useCallback(async () => {
        if (loadingPopular) return;
        setLoadingPopular(true);
        try {
            const bots = await fetchPopularBotTemplatesWithRevalidation(); // This might fetch only top 10, adjust if more needed
            setPopularTemplates(bots);
        } catch (error) {
            console.error("Failed to load popular bot templates:", error);
        }
        setLoadingPopular(false);
    }, [loadingPopular]);

    const loadSearchResults = useCallback(async (query: string, page: number) => {
        if (loadingSearch || !query) {
            if (!query) setSearchResults([]); // Clear results if query is empty
            return;
        }
        setLoadingSearch(true);
        try {
            const { bots, total } = await fetchBotTemplatesWithFiltersCached({
                page,
                pageSize: BOT_PAGE_SIZE,
                searchQuery: query,
                sort: 'popular'
            });
            setSearchResults(prev => page === 1 ? bots : [...prev, ...bots]);
            setHasMoreSearch(bots.length === BOT_PAGE_SIZE && (page * BOT_PAGE_SIZE) < total);
        } catch (error) {
            console.error("Failed to load search results:", error);
        }
        setLoadingSearch(false);
    }, [loadingSearch]);

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
            <ScrollArea className="h-[350px] pr-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bots.map(bot => (
                        <div key={bot.id} className="relative">
                            <BotCard {...bot} />
                            <Button 
                                size="sm"
                                className="absolute top-2 right-2 z-10 bg-indigo-500 hover:bg-indigo-600 text-xs"
                                onClick={() => onSelectBot(bot.id)}
                                disabled={selectedBotIds.includes(bot.id) || (maxSelection !== undefined && selectedBotIds.length >= maxSelection)}
                            >
                                {selectedBotIds.includes(bot.id) ? 'Selected' : 'Add'}
                            </Button>
                        </div>
                    ))}
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
            <DialogContent className="max-w-3xl bg-zinc-900 text-white border-zinc-700">
                <DialogHeader>
                    <DialogTitle>Select Bot Templates</DialogTitle>
                    <DialogDescription>
                        Choose at least two bot templates to add to your server template.
                        {maxSelection && ` You can select up to ${maxSelection} bots.`}
                    </DialogDescription>
                </DialogHeader>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-zinc-800">
                        <TabsTrigger value="my-templates">My Templates</TabsTrigger>
                        <TabsTrigger value="popular">Popular</TabsTrigger>
                        <TabsTrigger value="search">Search All</TabsTrigger>
                    </TabsList>
                    <TabsContent value="my-templates" className="mt-4">
                        {renderBotList(myTemplates, loadingMyTemplates, () => { setMyTemplatesPage(p => p + 1); loadMyTemplates(myTemplatesPage + 1); }, hasMoreMyTemplates)}
                    </TabsContent>
                    <TabsContent value="popular" className="mt-4">
                        {renderBotList(popularTemplates, loadingPopular)}
                        {/* Popular usually fetches a fixed small number, so no load more typically */}
                    </TabsContent>
                    <TabsContent value="search" className="mt-4">
                        <div className="flex items-center space-x-2 mb-4">
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
                        {renderBotList(searchResults, loadingSearch, () => { setSearchPage(p => p + 1); loadSearchResults(debouncedSearchQuery, searchPage + 1); }, hasMoreSearch)}
                    </TabsContent>
                </Tabs>
                <DialogFooter className="mt-6">
                    <Button variant="outline" onClick={onClose}>Done</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default BotTemplateSelector; 