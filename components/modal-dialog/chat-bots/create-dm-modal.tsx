'use client'

import qs from 'query-string';
import { PersonalBotSchema } from "@/zod-schemas";
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

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../ui/form";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { useParams, useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";
import { useEffect } from 'react';
import FileUpload from '@/components/islets/uploads/file-upload';


const CreateDmModal = () => {
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
            modelName: Object.values(AVAILABLE_MODELS)[0].name,
        }
    });

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (val: z.infer<typeof PersonalBotSchema>) => {
        try {
            const url = qs.stringifyUrl({
                url: '/api/personal-bot-creation',
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
            <DialogContent className='bg-black text-white p-0 overflow-hidden'>
                <DialogHeader className='pt-8 px-6'>
                    <DialogTitle className='text-2xl text-center font-bold '>
                        Create a new serverless bot
                    </DialogTitle>
                    <DialogDescription className='text-center text-zinc-300'>
                        <div>This bot won't be in any servers!</div> 
                    </DialogDescription>
                </DialogHeader>
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
                                                />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className='bg-primary text-secondary'>
                                            {Object.values(AVAILABLE_MODELS).map((model) => (
                                                <SelectItem key={model.id} value={model.name} className='capitalize'>
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
            </DialogContent>
        </Dialog>
    )
}

export default CreateDmModal;