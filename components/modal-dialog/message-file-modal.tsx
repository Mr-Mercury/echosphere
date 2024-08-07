'use client'

import { MessageFileUploadSchema } from "@/schemas";
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
} from "../ui/dialog"

import { Form, FormControl, FormField, FormItem } from "../ui/form";
import { Button } from "../ui/button";
import FileUpload from "../islets/uploads/file-upload";
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";
import { useSocket } from "../providers/socket-provider";
import qs from 'query-string';


const MessageFileModal = () => {
    const { isOpen, onClose, type, data } = useModal();
    const { socket, isConnected } = useSocket();
    const router = useRouter();

    const isModalOpen = isOpen && type === 'messageFile';
    const { apiUrl, query } = data;   

    const form = useForm({
        resolver: zodResolver(MessageFileUploadSchema),
        defaultValues: {
            fileUrl: '',
        }
    })

    const handleClose = () => {
        form.reset();
        onClose();
    }

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (val: z.infer<typeof MessageFileUploadSchema>) => {
        try {
            const url = qs.stringifyUrl({
                url: apiUrl || '',
                query,
            });
            //TODO: Find better workaround for content field
            const values = { fileUrl: val.fileUrl, content: val.fileUrl}
            
            socket.emit('message', { query, values })
            // Clearing 
            form.reset();
            router.refresh();
            handleClose();
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
            <DialogContent className='bg-black text-white p-0 overflow-hidden'>
                <DialogHeader className='pt-8 px-6'>
                    <DialogTitle className='text-2xl text-center font-bold '>
                        Add an attachment
                    </DialogTitle>
                    <DialogDescription className='text-center text-zinc-300'>
                        <div>Just don't upload anything illegal :| </div>
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                        <div className='space-y-8 px-6'>
                            <div className='flex items-center justify-center text-center'>
                                <FormField control={form.control} name='fileUrl' 
                                render={({field}) => (
                                    <FormItem>
                                        <FormControl>
                                            <FileUpload 
                                                endpoint='messageFile' value={field.value}
                                                onChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}/>
                            </div>
                        </div>
                        <DialogFooter className='px-6 py-4'>
                            <Button disabled={isLoading} variant='secondary'>
                                Send
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default MessageFileModal;