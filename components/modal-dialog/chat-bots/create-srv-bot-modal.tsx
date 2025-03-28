'use client'

import qs from 'query-string';
import { Server } from '@prisma/client';
import { ServerBotSchema } from "@/zod-schemas";
import { AVAILABLE_MODELS } from '@/lib/config/models';
import { ChatFrequency } from '@/lib/config/chat-variables';
import { currentUser } from '@/lib/utilities/data/fetching/currentUser';
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
} from "../../ui/dialog";

import { registerServerBotAction } from "@/app/actions/register-server-bot";

import { Textarea } from "../../ui/textarea";
import { ScrollArea} from "../../ui/scroll-area";
import { Checkbox } from "../../ui/checkbox";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../ui/form";

import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { useParams, useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";
import { useEffect, useState } from 'react';
import { ServerWithMembersAndProfiles } from '@/lib/entities/servers';
import FileUpload from '@/components/islets/uploads/file-upload';
import { Switch } from "../../ui/switch";

interface CreateServerBotModalProps {
    data?: {
        server?: ServerWithMembersAndProfiles;
    }
}


const CreateServerBotModal = ({ data }: CreateServerBotModalProps) => {
    const [imageUrl, setImageUrl] = useState<string>('');
    const [useDefaultImage, setUseDefaultImage] = useState(false);
    const { isOpen, onClose, type } = useModal();
    const router = useRouter();
    const params = useParams();

    const isModalOpen = isOpen && type ==='createServerBot';

    

    const form = useForm({
        resolver: zodResolver(ServerBotSchema),
        defaultValues: {
            name: '',
            profileDescription: '',
            systemPrompt: '',
            imageUrl: '',
            model: Object.keys(AVAILABLE_MODELS)[0],
            fullPromptControl: false,
            chatFrequency: ChatFrequency.Average,
            ourApiKey: true
        }
    });

    const setDefaultImage = () => {
        const defaultImageUrl = 'https://utfs.io/f/ae34682c-5a6c-4320-92ca-681cd4d93376-plqwlq.jpg';
        setImageUrl(defaultImageUrl);
        form.setValue('imageUrl', defaultImageUrl);
    }
    

    const selectedModel = form.watch('model');

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (val: z.infer<typeof ServerBotSchema>) => {
        try {
            const result = await registerServerBotAction(val, params?.serverId as string);

            if (result.error) {
                // TODO: Add proper error handling/display here
                console.error(result.error);
                return;
            }

            // Clearing 
            form.reset();
            router.refresh();
            onClose();
        } catch (error) {
            console.log(error);
        }
    }

    const handleClose = () => {
        form.reset()
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
                    <DialogTitle className='text-2xl text-center font-bold'>
                        <div className='flex items-center justify-center'>
                            {data?.server?.imageUrl && (
                                <img  
                                    src={data?.server?.imageUrl}
                                    alt={`${data?.server?.name} image`}
                                    className='w-8 h-8 outline outline-1 outline-offset-1 outline-gray rounded-full mr-4'
                                />
                            )}
                            <span>Create a new bot for <em>{data?.server?.name}</em></span>
                        </div>
                    </DialogTitle>
                    <DialogDescription className='text-center text-zinc-300'>
                        <div>This bot will only be active in the <strong>{data?.server?.name}</strong> context!</div> 
                    </DialogDescription>
                </DialogHeader>
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
                                                    {/* Un-kill CSS here - likely shadcn or radix issue */}
                                                    <SelectValue className='text-secondary'
                                                    placeholder='Select a model'
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
                                                    {/* Un-kill CSS here - likely shadcn or radix issue */}
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
                                    Create
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}

export default CreateServerBotModal;