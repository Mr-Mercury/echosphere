'use client'

import { ServerSchema } from "@/zod-schemas";
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

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../ui/form";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import FileUpload from "../../islets/uploads/file-upload";
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";
import { useEffect } from "react";


const ServerSettingsModal = () => {
    const { isOpen, onClose, type, data } = useModal();
    const router = useRouter();

    const isModalOpen = isOpen && type ==='editServer';
    const { server } = data;

    const form = useForm({
        resolver: zodResolver(ServerSchema),
        defaultValues: {
            name: '',
            imageUrl: '',
        }
    });

    useEffect(() => {
        if (server) {
            form.setValue('name', server.name);
            form.setValue('imageUrl', server.imageUrl);
        }
    }, [server, form])

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (val: z.infer<typeof ServerSchema>) => {
        try {
            await axios.patch(`${origin}/api/servers/${server?.id}/edit-server`, val);
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
                        Edit {server?.name}
                    </DialogTitle>
                    <DialogDescription className='text-center text-zinc-300'>
                        <div>Re-customize your server&apos;s name and image</div> 
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                        <div className='space-y-8 px-6'>
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
                            <FormField control={form.control} name='name' render={({field}) => (
                                <FormItem>
                                    <FormLabel className='uppercase text-xs font-bold text-secondary'>
                                        Server name
                                    </FormLabel>
                                    <FormControl>
                                        <Input disabled={isLoading} className='border-0 
                                        focus-visible:ring-0 text-secondary focus-visible:ring-offset-0'
                                        placeholder='Enter Server Name'
                                        {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter className='px-6 py-4'>
                            <Button disabled={isLoading} variant='secondary'>
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default ServerSettingsModal;