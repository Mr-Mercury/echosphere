'use client'

import qs from 'query-string';
import { ChannelSchema } from "@/zod-schemas";
import { ChannelType } from "@prisma/client";
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


const EditChannelModal = () => {
    const { isOpen, onClose, type, data } = useModal();
    const router = useRouter();

    const isModalOpen = isOpen && type ==='editChannel';
    const { channel, server } = data;

    const form = useForm({
        resolver: zodResolver(ChannelSchema),
        defaultValues: {
            name: '',
            type: channel?.type || ChannelType.TEXT,
        }
    });
    // Must use UseEffect because modal is rendered before you receive the channel's data
    useEffect(() => {
        if (channel) {
            form.setValue('name', channel.name);
            form.setValue('type', channel.type);
        }
    }, [form, channel])

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (val: z.infer<typeof ChannelSchema>) => {
        try {
            const url = qs.stringifyUrl({
                url: `/api/channels/${channel?.id}`,
                query: {
                    serverId: server?.id
                }
            })
            await axios.patch(url, val);
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
                        Edit Channel
                    </DialogTitle>
                    <DialogDescription className='text-center text-zinc-300'>
                        <div>Give it a descriptive name!</div> 
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                        <div className='space-y-8 px-6'>
                            <FormField control={form.control} name='name' render={({field}) => (
                                <FormItem>
                                    <FormLabel className='uppercase text-xs font-bold text-secondary'>
                                        Channel name
                                    </FormLabel>
                                    <FormControl>
                                        <Input disabled={isLoading} className='border-0 
                                        focus-visible:ring-0 text-secondary focus-visible:ring-offset-0'
                                        placeholder='Enter Channel'
                                        {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField control={form.control} name='type' render={({field}) => (
                                <FormItem>
                                    <FormLabel className='uppercase text-xs font-bold text-secondary'>Channel Type</FormLabel>
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
                                            {Object.values(ChannelType).map((type) => (
                                                <SelectItem key={type} value={type} className='capitalize'>
                                                    {type.toLowerCase()}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                            />
                        </div>
                        <DialogFooter className='px-6 py-4'>
                            <Button disabled={isLoading} variant='secondary'>
                                Save
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default EditChannelModal;