'use client'

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem } from '../ui/form';
import { Input } from '../ui/input';
import { Plus } from 'lucide-react';
import axios from 'axios';
import qs from 'query-string';
import { useSocket } from '../providers/socket-provider';
import { useModal } from '@/hooks/use-modal-store';
import EmojiMenu from '../islets/chat-window/emoji-menu';
import { useRouter } from 'next/navigation';

interface ChatInputProps {
    apiUrl: string;
    query: Record<string, any>;
    name: string;
    type: 'dm' | 'channel';
}

const formSchema = z.object({
    content: z.string().min(1)
})

const ChatInput = ({apiUrl, query, name, type}: ChatInputProps) => {
    const { onOpen } = useModal(); 
    const { socket } = useSocket();
    const router = useRouter();


    const form = useForm<z.infer<typeof formSchema>>({
        defaultValues: {
            content: '',
        }, 
        resolver: zodResolver(formSchema),
    });

    const isLoading = form.formState.isSubmitting;
    
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            //TODO - use Querystring again
            const url = qs.stringifyUrl({
                url: apiUrl,
                query,
            });

            if (socket) { 
                socket.emit('message', { query, values, type });
                form.reset();
                router.refresh();
            };
        } catch(error) {
                (error);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField 
                    control={form.control} 
                    name='content' 
                    render={({field}) => {
                        return (
                            <FormItem>
                                <FormControl>
                                    <div className='relative p-4 pb-6'>
                                        <button 
                                            type='button' 
                                            onClick={()=>{onOpen('messageFile', { apiUrl, query })}}
                                            className='absolute top-7 left-8 h-[24px] w-[24px] 
                                            bg-zinc-400 hover:bg-zinc-300 transition rounded-full 
                                            p-1 flex items-center justify-center'>
                                            <Plus className='text-[#313338]'/>
                                        </button>
                                        <Input 
                                            disabled={isLoading} 
                                            className='px-14 py-6 bg-zinc-700/70 border-none 
                                            border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-200'
                                            placeholder={`Message ${type === 'dm' ? name : '#' + name}`}
                                            autoComplete="off"
                                            {...field}
                                        />
                                        <div className='absolute top-7 right-8'>
                                            <EmojiMenu onChange={(emoji:string) => {
                                                field.onChange(`${field.value} ${emoji}`)
                                            }}/>
                                        </div>
                                    </div>
                                </FormControl>
                            </FormItem>
                        )
                    }}/>
            </form>
        </Form>
    )
}

export default ChatInput;