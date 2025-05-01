'use client'

import qs from 'query-string';
import { ServerBotSchema } from "@/zod-schemas";
import { AVAILABLE_MODELS } from '@/lib/config/models';
import { ChatFrequency } from '@/lib/config/chat-variables';
import axios from 'axios';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from "react-hook-form"
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle 
} from "../../ui/dialog"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../ui/form";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { ScrollArea } from "../../ui/scroll-area";
import { Checkbox } from "../../ui/checkbox";
import { Switch } from "../../ui/switch";
import { Button } from "../../ui/button";
import { useParams, useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";
import { useEffect, useState } from 'react';
import FileUpload from '@/components/islets/uploads/file-upload';
import { Loader2 } from "lucide-react";

const EditBotModal = () => {
    const [imageUrl, setImageUrl] = useState<string>('');
    const [useDefaultImage, setUseDefaultImage] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const { isOpen, onClose, type, data } = useModal();
    const router = useRouter();
    const params = useParams();
    
    const isModalOpen = isOpen && type === 'editBot';
    const botId = data.botUser?.id;

    useEffect(() => {
        console.log("Modal data:", data);
        console.log("Bot ID:", botId);
    }, [data, botId]);

    const form = useForm({
        resolver: zodResolver(ServerBotSchema),
        defaultValues: {
            name: '',
            profileDescription: '',
            systemPrompt: '',
            imageUrl: '',
            model: Object.keys(AVAILABLE_MODELS)[0],
            chatFrequency: ChatFrequency.Average,
            ourApiKey: true,
            fullPromptControl: false
        }
    });

    const setDefaultImage = () => {
        const defaultImageUrl = 'https://utfs.io/f/ae34682c-5a6c-4320-92ca-681cd4d93376-plqwlq.jpg';
        setImageUrl(defaultImageUrl);
        form.setValue('imageUrl', defaultImageUrl);
    }

    const selectedModel = form.watch('model');

    useEffect(() => {
        if (isModalOpen && botId) {
            const loadBotData = async () => {
                setIsFetching(true);
                try {
                    const query = qs.stringifyUrl({
                        url: '/api/bots/server-bots/single-bot',
                        query: { id: botId }
                    });

                    const { data } = await axios.get(query);
                    
                    // Set form values from the fetched data
                    form.setValue('name', data.botUser.name);
                    form.setValue('model', data.modelName);
                    form.setValue('imageUrl', data.botUser.image);
                    form.setValue('profileDescription', data.description);
                    form.setValue('systemPrompt', data.systemPrompt);
                    form.setValue('chatFrequency', data.chatFrequency);
                    form.setValue('ourApiKey', data.useSystemKey || true);
                    form.setValue('fullPromptControl', data.fullPromptControl || false);

                    // Update UI state
                    setImageUrl(data.botUser.image);
                    setUseDefaultImage(data.botUser.image === 'https://utfs.io/f/ae34682c-5a6c-4320-92ca-681cd4d93376-plqwlq.jpg');
                } catch (error) {
                    console.error("Failed to load bot data:", error);
                } finally {
                    setIsFetching(false);
                }
            };

            loadBotData();
        }
    }, [isModalOpen, botId, form]);

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (val: z.infer<typeof ServerBotSchema>) => {
        try {
            const url = qs.stringifyUrl({
                url: '/api/bots/server-bots/single-bot',
                query: { id: botId }
            });

            // Prepare data for the patch request
            const updateData = {
                modelName: val.model,
                description: val.profileDescription,
                systemPrompt: val.systemPrompt,
                chatFrequency: val.chatFrequency,
                useSystemKey: val.ourApiKey,
                fullPromptControl: val.fullPromptControl,
                botName: val.name,
                image: val.imageUrl
            };

            await axios.patch(url, updateData);
            
            // Success handling
            form.reset();
            router.refresh();
            onClose();
        } catch (error) {
            console.error("Failed to update bot:", error);
        }
    }

    const handleClose = () => {
        form.reset();
        onClose();
    }

    const getMaxSystemPromptLength = (model: string) => {
        return AVAILABLE_MODELS[model]?.maxSystemPromptLength ?? 1000;
    };

    const getCharacterCountDisplay = (currentLength: number, maxLength?: number) => {
        const limit = maxLength ?? getMaxSystemPromptLength(selectedModel);
        return `${currentLength} / ${limit} characters`;
    };

    const handleImageToggle = (checked: boolean) => {
        setUseDefaultImage(checked);
        if (checked) {
            setDefaultImage();
        } else {
            setImageUrl('');
            form.setValue('imageUrl', '');
        }
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
            <DialogContent className='bg-black text-white p-0 max-w-2xl overflow-hidden'>
                <DialogHeader className='pt-8 px-6'>
                    <DialogTitle className='text-2xl text-center font-bold '>
                        Edit Bot
                    </DialogTitle>
                    <DialogDescription className='text-center text-zinc-300'>
                        <div>Update your bot's settings and personality</div> 
                    </DialogDescription>
                </DialogHeader>
                {isFetching ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
                        <p className="text-xs text-zinc-500 mt-2">Loading bot configuration...</p>
                    </div>
                ) : (
                <ScrollArea className='max-h-[80vh] px-6'>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                            <div className='space-y-8 px-6'>
                                <FormField control={form.control} name='name' render={({field}) => (
                                    <FormItem>
                                        <FormLabel className='uppercase text-xs font-bold text-secondary'>
                                            Bot name
                                        </FormLabel>
                                        <FormControl>
                                            <Input disabled={isLoading} className='border-0 
                                            focus-visible:ring-0 text-secondary focus-visible:ring-offset-0'
                                            placeholder='Name'
                                            {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <FormField control={form.control} name='profileDescription' render={({field}) => (
                                    <FormItem>
                                        <FormLabel className='uppercase text-xs font-bold text-secondary'>
                                            Bot Description
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea 
                                                disabled={isLoading} 
                                                className='border-0 focus-visible:ring-0 text-secondary focus-visible:ring-offset-0 resize-none'
                                                placeholder='Describe this bot'
                                                {...field}
                                                maxLength={500}
                                                />
                                        </FormControl> 
                                        <FormMessage />
                                        <div className="text-xs text-muted-foreground text-right">
                                            {getCharacterCountDisplay(
                                                field.value?.length ?? 0,
                                                300
                                            )}
                                        </div>
                                    </FormItem>
                                )} 
                                />
                                <FormField control={form.control} name='systemPrompt' render={({field}) => (
                                    <FormItem>
                                        <div className='flex items-center justify-between'>
                                            <FormLabel className='uppercase text-xs font-bold text-secondary'>
                                                Bot Prompt
                                            </FormLabel>
                                            <div className='flex items-center space-x-2'>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    const description = form.getValues('profileDescription');
                                                    form.setValue('systemPrompt', description);
                                                }}
                                                className='text-xs text-muted-foreground hover:text-white'
                                            >
                                                Copy Bot Description
                                            </Button>
                                                <Checkbox 
                                                    id='fullPromptControl'
                                                    checked={form.watch('fullPromptControl')}
                                                    onCheckedChange={(checked) => form.setValue('fullPromptControl', checked as boolean)}
                                                    className='border-[1px] border-white/50 data-[state=checked]:border-white'
                                                />
                                                <label htmlFor='fullPromptControl' className='text-xs text-muted-foreground cursor-pointer'>
                                                    Full prompt control
                                                </label>
                                            </div>
                                        </div>
                                            <FormControl>
                                                <Textarea 
                                                    disabled={isLoading} 
                                                    className='border-0 focus-visible:ring-0 text-secondary focus-visible:ring-offset-0 resize-none'
                                                    placeholder='Enter your prompt here'
                                                    rows={15}
                                                    {...field}
                                                    maxLength={AVAILABLE_MODELS[selectedModel]?.maxSystemPromptLength ?? 1000}
                                                    />
                                            </FormControl>
                                            <div className="text-xs text-muted-foreground text-right">
                                                {getCharacterCountDisplay(
                                                    field.value?.length ?? 0,
                                                    AVAILABLE_MODELS[selectedModel]?.maxSystemPromptLength ?? 1000
                                                )}
                                            </div>
                                            <FormMessage />
                                    </FormItem>
                                )} 
                                />
                                <FormField control={form.control} name='chatFrequency' render={({field}) => (
                                    <FormItem>
                                        <FormLabel className='uppercase text-xs font-bold text-secondary'>Chat Frequency</FormLabel>
                                        <Select disabled={isLoading} 
                                        onValueChange={field.onChange} 
                                        defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger
                                                    className='border-0
                                                    focus:ring-0 ring-offset-0
                                                    focus:ring-offset-0 capitalize outline-none'
                                                >
                                                    <SelectValue className='text-secondary'
                                                    placeholder='Select frequency'
                                                    />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className='bg-primary text-secondary'>
                                                {Object.values(ChatFrequency).map((frequency) => (
                                                    <SelectItem key={frequency} value={frequency} className='capitalize'>
                                                        {frequency.toLowerCase().replace('_', ' ')}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <FormField control={form.control} name='model' render={({field}) => (
                                    <FormItem>
                                        <FormLabel className='uppercase text-xs font-bold text-secondary'>Model </FormLabel>
                                        <Select disabled={isLoading} 
                                        onValueChange={field.onChange} 
                                        defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger
                                                    className='border-0
                                                    focus:ring-0 ring-offset-0
                                                    focus:ring-offset-0 capitalize outline-none'
                                                >
                                                    <SelectValue className='text-secondary'
                                                    placeholder='Select a model'
                                                    />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className='bg-primary text-secondary'>
                                                {Object.entries(AVAILABLE_MODELS).map(([key, model]) => (
                                                    <SelectItem key={key} value={key} className='capitalize'>
                                                        {model.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <div className='space-y-4'>
                                    <div className='flex items-center justify-between px-2'>
                                        <div className='flex items-center space-x-2'>
                                            <Switch 
                                                checked={useDefaultImage}
                                                onCheckedChange={handleImageToggle}
                                            />
                                            <span className='text-xs text-muted-foreground'>
                                                Use default avatar
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className='flex items-center justify-center text-center'>
                                        <FormField 
                                            control={form.control} 
                                            name='imageUrl' 
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormControl>
                                                        {useDefaultImage ? (
                                                            <div className='relative w-24 h-24'>
                                                                <img 
                                                                    src={field.value}
                                                                    alt="Default avatar"
                                                                    className='rounded-full w-full h-full object-cover'
                                                                />
                                                            </div>
                                                        ) : (
                                                            <FileUpload 
                                                                endpoint='serverImage' 
                                                                value={field.value}
                                                                onChange={field.onChange} 
                                                            />
                                                        )}
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter className='px-6 py-4'>
                                <Button disabled={isLoading} variant='secondary'>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        "Update Bot"
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </ScrollArea>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default EditBotModal;