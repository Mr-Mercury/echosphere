'use client'

import qs from 'query-string';
import { PersonalBotSchema } from "@/zod-schemas";
import { AVAILABLE_MODELS } from '@/shared/config/models';
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
import { Button } from "../../ui/button";
import { useParams, useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";
import FileUpload from '@/components/islets/uploads/file-upload';
import { Textarea } from "../../ui/textarea";
import { ScrollArea } from "../../ui/scroll-area";
import { Checkbox } from "../../ui/checkbox";


const CreateBotConversationModal = () => {
    const { isOpen, onClose, type } = useModal();
    const router = useRouter();
    const params = useParams();

    const isModalOpen = isOpen && type ==='createDM';

    const form = useForm({
        resolver: zodResolver(PersonalBotSchema),
        defaultValues: {
            name: '',
            profileDescription: '',
            systemPrompt: '',
            imageUrl: '',
            model: Object.keys(AVAILABLE_MODELS)[0],
            fullPromptControl: false,
        }
    });

    const selectedModel = form.watch('model');
    const isLoading = form.formState.isSubmitting;

    const getMaxSystemPromptLength = (model: string) => {
        return AVAILABLE_MODELS[model]?.maxSystemPromptLength ?? 1000;
    };

    const getCharacterCountDisplay = (currentLength: number, maxLength?: number) => {
        const limit = maxLength ?? getMaxSystemPromptLength(selectedModel);
        return `${currentLength} / ${limit} characters`;
    };

    const onSubmit = async (val: z.infer<typeof PersonalBotSchema>) => {
        try {
            const url = qs.stringifyUrl({
                url: '/api/bots/personal-bots/single-bot',
                query: {
                    userId: params?.serverId
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

    return (
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
            <DialogContent className='bg-black text-white p-0 max-w-2xl overflow-hidden'>
                <DialogHeader className='pt-8 px-6'>
                    <DialogTitle className='text-2xl text-center font-bold '>
                        Create a new personal bot
                    </DialogTitle>
                    <DialogDescription className='text-center text-zinc-300'>
                        <div>This bot will be your personal AI assistant!</div> 
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

export default CreateBotConversationModal;