'use client'

import { ServerTemplateCreateSchema } from "@/zod-schemas";
import axios from 'axios';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/islets/uploads/file-upload";
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";
import { useEffect, useState } from 'react';
import { ChannelType } from "@prisma/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, XCircle, X as XIcon } from "lucide-react";
import BotTemplateSelector from "@/components/islets/bot-template-selector/bot-template-selector";
import { Bot } from "@/lib/entities/bot-display-types";
import NavTooltip from "@/components/server-listing-sidebar-components/nav-tooltip";

// TODO: Refine this type later if needed
interface ChannelInput {
    id: string; // REACT KEY PROP
    name: string;
    type: ChannelType;
    topic?: string;
}

const CreateServerTemplateModal = () => {
    const { isOpen, onClose, type, data: modalHookData } = useModal();
    const router = useRouter();
    const currentUserId = modalHookData?.userId;

    const isModalOpen = isOpen && type === 'createServerTemplate';

    // Dynamic state
    const [channels, setChannels] = useState<ChannelInput[]>([]);
    const [selectedBotTemplateIds, setSelectedBotTemplateIds] = useState<string[]>([]);
    const [selectedBotObjects, setSelectedBotObjects] = useState<Bot[]>([]);
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [loadingBotDetails, setLoadingBotDetails] = useState(false);

    const form = useForm<z.infer<typeof ServerTemplateCreateSchema>>({
        resolver: zodResolver(ServerTemplateCreateSchema),
        defaultValues: {
            serverName: '',
            description: '',
            serverImageUrl: '',
            channels: [],
            botTemplateIds: [],
            isPublic: true,
        }
    });

    // Syncs local state w/ react-hook-form state for submission - has temporary client side id for channels
    useEffect(() => {
        form.setValue('channels', channels.map(({ id, ...rest }) => rest)); 
    }, [channels, form]);

    useEffect(() => {
        form.setValue('botTemplateIds', selectedBotTemplateIds);

        // Fetch details for IDs that are in selectedBotTemplateIds but not yet in selectedBotObjects
        const idsToFetch = selectedBotTemplateIds.filter(id => 
            !selectedBotObjects.some(obj => obj.id === id)
        );

        if (idsToFetch.length > 0) {
            setLoadingBotDetails(true);
            axios.post<Bot[]>('/api/templates/bots/by-ids', { ids: idsToFetch })
                .then(response => {
                    setSelectedBotObjects(prevObjs => {
                        const newBotsMap = new Map(response.data.map(bot => [bot.id, bot]));
                        const updatedObjects = [...prevObjs];
                        idsToFetch.forEach(id => {
                            const botDetail = newBotsMap.get(id);
                            if (botDetail && !updatedObjects.some(obj => obj.id === id)) { // Ensure no duplicates if somehow already present
                                updatedObjects.push(botDetail);
                            }
                        });
                        // Maintain selection order (not super important, remove if creates performance issues)
                        return selectedBotTemplateIds.map(id => updatedObjects.find(obj => obj.id === id)).filter(Boolean) as Bot[];
                    });
                })
                .catch(error => {
                    console.error("CreateServerTemplateModal Failed to fetch bot template details:", error);
                    // TODO: handle removal of IDs that failed to fetch from selectedBotTemplateIds here
                })
                .finally(() => {
                    setLoadingBotDetails(false);
                });
        } else if (selectedBotTemplateIds.length === 0 && selectedBotObjects.length > 0) {
            // If all IDs are removed, clear objects (though handleSelectBot should also do this for individual removals)
            setSelectedBotObjects([]);
        } else if (selectedBotTemplateIds.length > 0 && selectedBotObjects.length > 0) {
            // If IDs exist, ensure selectedBotObjects are in the same order and contain only those IDs
            // Handle cases where an external change desyncs, maintain consistency.
            const orderedAndFilteredBots = selectedBotTemplateIds
                .map(id => selectedBotObjects.find(obj => obj.id === id))
                .filter(Boolean) as Bot[];
            if (orderedAndFilteredBots.length !== selectedBotObjects.length || 
                !orderedAndFilteredBots.every((bot, index) => bot.id === selectedBotObjects[index]?.id)) {
                setSelectedBotObjects(orderedAndFilteredBots);
            }
        }

    }, [selectedBotTemplateIds, form.setValue]);

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof ServerTemplateCreateSchema>) => {
        try {
            await axios.post('/api/templates/servers', values);
            form.reset();
            setSelectedBotTemplateIds([]);
            setChannels([]);
            setSelectedBotObjects([]);
            setIsSelectorOpen(false);
            router.refresh();
            onClose();
        } catch (error) {
            console.error("Error creating server template:", error);
            // TODO: Add user-friendly error display
        }
    };

    const handleClose = () => {
        form.reset();
        setSelectedBotTemplateIds([]);
        setChannels([]);
        setSelectedBotObjects([]);
        setIsSelectorOpen(false);
        onClose();
    };

    // --- Channel Management --- 
    const addChannel = () => {
        setChannels(prev => [...prev, { id: Date.now().toString(), name: '', type: ChannelType.TEXT, topic: '' }]);
    };

    const removeChannel = (id: string) => {
        setChannels(prev => prev.filter(channel => channel.id !== id));
    };

    const handleChannelChange = (id: string, field: keyof Omit<ChannelInput, 'id'>, value: string | ChannelType) => {
        setChannels(prev => prev.map(channel => 
            channel.id === id ? { ...channel, [field]: value } : channel
        ));
    };

    // --- Bot Template Selection Management ---
    const handleSelectBot = (botId: string) => {
        const isCurrentlySelected = selectedBotTemplateIds.includes(botId);
        
        setSelectedBotTemplateIds(prevIds => {
            if (isCurrentlySelected) {
                return prevIds.filter(id => id !== botId);
            } else {
                return [...prevIds, botId];
            }
        });

        if (isCurrentlySelected) {
            setSelectedBotObjects(prevObjs => prevObjs.filter(obj => obj.id !== botId));
        }
    };

    useEffect(() => {
        if (!isOpen) {
            form.reset();
            setSelectedBotTemplateIds([]);
            setChannels([]);
            setSelectedBotObjects([]);
            setIsSelectorOpen(false);
        }
    }, [isOpen, form]);

    return (
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
            <DialogContent className='bg-black text-white p-0 max-w-2xl overflow-hidden'>
                <DialogHeader className='pt-8 px-6'>
                    <DialogTitle className='text-2xl text-center font-bold'>
                        Create a New Server Template
                    </DialogTitle>
                    <DialogDescription className='text-center text-zinc-300'>
                        Configure your server template with a name, image, channels, and pre-selected bots.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className='max-h-[70vh]'>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8 p-6'>
                            {/* Server Details Section */}
                            <FormField control={form.control} name='serverName' render={({field}) => (
                                <FormItem>
                                    <FormLabel className='uppercase text-xs font-bold text-secondary'>Server Template Name</FormLabel>
                                    <FormControl>
                                        <Input disabled={isLoading} {...field} placeholder='Enter template name' className='bg-zinc-700/70 border-none' />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name='description' render={({field}) => (
                                <FormItem>
                                    <FormLabel className='uppercase text-xs font-bold text-secondary'>Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Input disabled={isLoading} {...field} placeholder='Describe your template' className='bg-zinc-700/70 border-none' />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <div className='flex flex-col space-y-2'>
                                <FormLabel className='uppercase text-xs font-bold text-secondary'>Server Image (Optional)</FormLabel>
                                <FormField control={form.control} name='serverImageUrl' render={({field}) => (
                                    <FormItem className='flex items-center justify-center text-center'>
                                        <FormControl>
                                            <FileUpload endpoint='serverImage' value={field.value || ''} onChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}/>
                                <FormMessage className='text-center'>{form.formState.errors.serverImageUrl?.message}</FormMessage>
                            </div>
                            
                            <FormField control={form.control} name='isPublic' render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-zinc-700/30">
                                    <div className="space-y-0.5">
                                        <FormLabel className='text-base'>Make Template Public</FormLabel>
                                        <DialogDescription className='text-xs'>
                                            Allow other users to find and use this template.
                                        </DialogDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            disabled={isLoading}
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )} />

                            {/* Channels Section */}
                            <div className='space-y-4'>
                                <div className='flex justify-between items-center'>
                                    <FormLabel className='uppercase text-xs font-bold text-secondary'>Channels</FormLabel>
                                    <Button type="button" variant="outline" size="sm" onClick={addChannel} disabled={isLoading} className='text-xs'>
                                        <PlusCircle className="h-4 w-4 mr-2" />
                                        Add Channel
                                    </Button>
                                </div>
                                {channels.length === 0 && (
                                    <p className='text-sm text-zinc-400'>No channels defined. New servers will get a default 'general' text channel.</p>
                                )}
                                <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                                    {channels.map((channel, index) => (
                                        <div key={channel.id} className='flex items-center space-x-2 p-3 bg-zinc-700/30 rounded-md'>
                                            <Input 
                                                value={channel.name} 
                                                onChange={(e) => handleChannelChange(channel.id, 'name', e.target.value)}
                                                placeholder={`Channel ${index + 1} Name`} 
                                                className='bg-zinc-600/50 border-none h-9'
                                                disabled={isLoading}
                                            />
                                            <Select 
                                                value={channel.type} 
                                                onValueChange={(value: ChannelType) => handleChannelChange(channel.id, 'type', value)}
                                                disabled={isLoading}
                                            >
                                                <SelectTrigger className="w-[120px] bg-zinc-600/50 border-none h-9">
                                                    <SelectValue placeholder="Type" />
                                                </SelectTrigger>
                                                <SelectContent className='bg-zinc-800 text-white'>
                                                    {Object.values(ChannelType).map(type => (
                                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Input 
                                                value={channel.topic} 
                                                onChange={(e) => handleChannelChange(channel.id, 'topic', e.target.value)}
                                                placeholder='Topic (Optional)' 
                                                className='bg-zinc-600/50 border-none h-9'
                                                disabled={isLoading}
                                            />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeChannel(channel.id)} disabled={isLoading} className='text-rose-500 hover:text-rose-600'>
                                                <XCircle className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <FormMessage>{form.formState.errors.channels?.message || (form.formState.errors.channels as any)?.root?.message}</FormMessage>
                            </div>

                            {/* Bot Templates Section */}
                            <div className='space-y-4'>
                                <div className='flex justify-between items-center'>
                                    <FormLabel className='uppercase text-xs font-bold text-secondary'>Bot Templates (Min. 2)</FormLabel>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => setIsSelectorOpen(true)} 
                                        disabled={isLoading}
                                        className='text-xs'
                                    >
                                        <PlusCircle className="h-4 w-4 mr-2" />
                                        {selectedBotTemplateIds.length > 0 ? 'Edit Bots' : 'Add Bots'}
                                    </Button>
                                </div>
                                
                                {loadingBotDetails && selectedBotTemplateIds.length > 0 && (
                                    <p className="text-sm text-zinc-400">Loading bot details...</p>
                                )}

                                {!loadingBotDetails && selectedBotTemplateIds.length === 0 && (
                                    <p className="text-sm text-zinc-400">No bot templates selected. You must select at least two.</p>
                                )}

                                {!loadingBotDetails && selectedBotObjects.length > 0 && (
                                    <div className="flex flex-wrap gap-3 p-2 bg-zinc-700/20 rounded-md min-h-[50px]">
                                        {selectedBotObjects.map(bot => (
                                            <NavTooltip key={bot.id} label={bot.name} side="top" align="center">
                                                <div className="relative group">
                                                    <img 
                                                        src={bot.imageUrl || 'https://utfs.io/f/1c8f7f2e-3f5e-47f7-9b7e-9d9f1f6a3b5c-1q2w3e.png'} 
                                                        alt={bot.name} 
                                                        className="w-12 h-12 rounded-full object-cover border-2 border-zinc-600 group-hover:border-indigo-500 transition-colors"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSelectBot(bot.id)}
                                                        className="absolute -top-1 -right-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        aria-label={`Remove ${bot.name}`}
                                                        disabled={isLoading}
                                                    >
                                                        <XIcon size={14} />
                                                    </button>
                                                </div>
                                            </NavTooltip>
                                        ))}
                                    </div>
                                )}
                                <FormMessage>{form.formState.errors.botTemplateIds?.message}</FormMessage>
                            </div>

                            <DialogFooter className='px-0 pt-4'>
                                <Button type="button" variant="ghost" onClick={handleClose} disabled={isLoading}>Cancel</Button>
                                <Button type="submit" variant="secondary" disabled={isLoading}>
                                    Create Template
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </ScrollArea>
                
                {currentUserId && (
                    <BotTemplateSelector 
                        isOpen={isSelectorOpen}
                        onClose={() => setIsSelectorOpen(false)}
                        currentUserId={currentUserId}
                        selectedBotIds={selectedBotTemplateIds}
                        onSelectBot={handleSelectBot}
                    />
                )}
            </DialogContent>
        </Dialog>
    )
}

export default CreateServerTemplateModal; 