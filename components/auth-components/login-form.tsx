'use client'

import * as z from 'zod';
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema } from '@/schemas';
import { Input } from '../ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";

export const LoginForm = ({}) => {

    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: '',
            password: '',
        }
    }); 

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(() => {})}
            className='space-y-6'>
                <div className='space-y-4'>
                    <FormField control={form.control} name='email' 
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input {...field}
                                placeholder='mail@mailtown.com'
                                type='email'
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem> 
                    )}/>
                    <FormField control={form.control} name='password' 
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input {...field}
                                placeholder='********'
                                type='password'
                                />
                            </FormControl>
                        </FormItem> 
                    )}/>
                </div>
            </form>
        </Form>
    )
}
