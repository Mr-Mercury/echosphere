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
import { PlusCircle, XCircle } from "lucide-react";
import BotTemplateSelector from "@/components/islets/bot-template-selector/bot-template-selector";

// TODO: Refine this type later if needed
interface ChannelInput {
    id: string; // For React key prop
    name: string;
    type: ChannelType;
    topic?: string;
}

const CreateServerTemplateModal = () => {
    const { isOpen, onClose, type, data: modalHookData } = useModal();
    const router = useRouter();
    const currentUserId = modalHookData?.userId;

    const isModalOpen = isOpen && type === 'createServerTemplate';

    // State for dynamic parts of the form
    const [channels, setChannels] = useState<ChannelInput[]>([]);
    const [selectedBotTemplateIds, setSelectedBotTemplateIds] = useState<string[]>([]);
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);

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

    // Sync local state with react-hook-form state for submission
    useEffect(() => {
        form.setValue('channels', channels.map(({ id, ...rest }) => rest)); // Remove temporary client-side id
    }, [channels, form]);

    useEffect(() => {
        form.setValue('botTemplateIds', selectedBotTemplateIds);
    }, [selectedBotTemplateIds, form]);

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof ServerTemplateCreateSchema>) => {
        try {
            await axios.post('/api/server-templates', values);
            form.reset();
            setSelectedBotTemplateIds([]);
            setChannels([]);
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
        setSelectedBotTemplateIds(prev => {
            if (prev.includes(botId)) {
                return prev.filter(id => id !== botId);
            } else {
                // Optional: Add logic here if there's a max number of selections
                return [...prev, botId];
            }
        });
    };

    // Effect to reset internal state if modal is closed externally or data changes
    useEffect(() => {
        if (!isOpen) {
            form.reset();
            setSelectedBotTemplateIds([]);
            setChannels([]);
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
                                        disabled={isLoading || !currentUserId}
                                        className='text-xs'
                                    >
                                        <PlusCircle className="h-4 w-4 mr-2" />
                                        Add Bot
                                    </Button>
                                </div>

                                {selectedBotTemplateIds.length === 0 && (
                                    <p className='text-sm text-zinc-400'>No bot templates selected. You need to select at least two.</p>
                                )}
                                
                                <div className="flex flex-wrap gap-2">
                                    {selectedBotTemplateIds.map(botId => (
                                        <div key={botId} className="flex items-center bg-zinc-700/50 p-2 rounded-md text-sm">
                                            <span>Bot ID: {botId.substring(0, 8)}...</span> 
                                            <Button 
                                                type="button" 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-5 w-5 ml-2 text-rose-500 hover:text-rose-600"
                                                onClick={() => handleSelectBot(botId)}
                                            >
                                                <XCircle className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
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