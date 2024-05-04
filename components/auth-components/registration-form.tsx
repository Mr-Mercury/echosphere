'use client'

import * as z from 'zod';
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { RegistrationSchema } from '@/schemas';
import { Input } from '../ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Button } from '../ui/button';
import { FormError } from '../islets/auth/auth-form-error';
import { FormSuccess } from '../islets/auth/auth-form-success';
import { loginAction } from '@/app/actions/login';
import { useTransition, useState } from 'react';

export const RegistrationForm = ({}) => {
    const [useError, setError] = useState<string | undefined>('');
    const [useSuccess, setSuccess] = useState<string | undefined>('');
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof RegistrationSchema>>({
        resolver: zodResolver(RegistrationSchema),
        defaultValues: {
            email: '',
            password: '',
            username: '',
        }
    }); 
// useTransition here to facilitate smooth caching 
    const onSubmit = (values: z.infer<typeof RegistrationSchema>) => {
        setError('');
        setSuccess('');

        startTransition(() => {
            loginAction(values)
                .then((data) => {
                    setError(data.error);
                    setSuccess(data.success);
                });  
        })
    }
    // I spent like 15 minutes trying to figure out why handleSubmit didn't work
    // for future reference, with useForm, that handleSubmit needs to be passed a 
    // FUNCTION DEFINITION, it will automatically pass it the event.  Nice. 
    return (
        <Form {...form}>
            <form 
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-6'>
                <div className='space-y-4'>
                    <FormField control={form.control} name='email' 
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input {...field}
                                disabled={isPending}
                                placeholder='mail@mailtown.com'
                                type='email'
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem> 
                    )}/>
                    <FormField control={form.control} name='username' 
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input {...field}
                                disabled={isPending}
                                placeholder='username'
                                type='name'
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
                                disabled={isPending}
                                placeholder='********'
                                type='password'
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem> 
                    )}/>
                </div>
                <FormError message={useError}/>
                <FormSuccess message={useSuccess} />
                <Button disabled={isPending} type='submit' className='w-full' variant='outline'>
                    Login
                </Button>
            </form>
        </Form>
    )
}
