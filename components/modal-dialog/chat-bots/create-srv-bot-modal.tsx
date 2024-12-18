'use client'

import qs from 'query-string';
import { Server } from '@prisma/client';
import { ServerBotSchema } from "@/schemas";
import { AVAILABLE_MODELS } from '@/lib/config/models';
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

import { Textarea } from "../../ui/textarea";
import { ScrollArea} from "../../ui/scroll-area";
import { Checkbox } from "../../ui/checkbox";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../ui/form";

import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { useParams, useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";
import { useEffect } from 'react';
import { ServerWithMembersAndProfiles } from '@/lib/entities/servers';
import FileUpload from '@/components/islets/uploads/file-upload';

interface CreateServerBotModalProps {
    data?: {
        server?: ServerWithMembersAndProfiles;
    }
}


const CreateServerBotModal = ({ data }: CreateServerBotModalProps) => {
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
            modelName: Object.values(AVAILABLE_MODELS)[0].name,
            fullPromptControl: false,
        }
    });

    const selectedModel = form.watch('modelName');

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (val: z.infer<typeof ServerBotSchema>) => {
        try {
            const url = qs.stringifyUrl({
                url: '/api/server-bot-creation',
                query: {
                    serverId: params?.serverId
                }
            })
            await axios.post(url, val);
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

    const getMaxSystemPromptLength = (modelName: string) => {
        return AVAILABLE_MODELS[modelName]?.maxSystemPromptLength ?? 1000;
    };

    const getCharacterCountDisplay = (currentLength: number, maxLength?: number) => {
        const limit = maxLength ?? getMaxSystemPromptLength(selectedModel);
        return `${currentLength} / ${limit} characters`;
    };

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
                                <FormField control={form.control} name='modelName' render={({field}) => (
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
                                                {Object.values(AVAILABLE_MODELS).map((model) => (
                                                    <SelectItem key={model.name} value={model.name} className='capitalize'>
                                                        {model.name.toLowerCase()}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <div className='flex items-center justify-center text-center'>
                                    <FormField control={form.control} name='imageUrl' 
                                    render={({field}) => (
                                        <FormItem>
                                            <FormControl>
                                                <FileUpload 
                                                    endpoint='serverImage' value={field.value}
                                                    onChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )}/>
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